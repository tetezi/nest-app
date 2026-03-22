import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config';
import { omit } from 'lodash';
import {
  ChatCompletionMessageToolCall,
  ChatCompletionFunctionTool,
  ResponseFormatJSONSchema,
  ResponseFormatJSONObject,
} from 'openai/resources/index';
import { createSseReadable } from 'src/utils/createSseReadable';

function useChatToolsHook(
  tools: Array<ChatCompletionFunctionTool & { callFunction: (argu) => string }>,
) {
  async function tryToolCall(name: string, argu: string) {
    let res;
    try {
      const func = tools.find((t) => {
        return t.type === 'function' && t.function.name === name;
      })?.callFunction;
      res = func ? func?.(JSON.parse(argu)) : undefined;
    } catch (err) {}
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    return res;
  }
  return {
    chatCompletionTools: tools.map((tool) => {
      return omit(tool, 'callFunction') as ChatCompletionFunctionTool;
    }),
    tryToolCall,
  };
}

@Injectable()
export class OpenAIService {
  private readonly openAI: OpenAI;
  constructor(private configService: ConfigService<AllConfigType>) {
    const { apiKey, baseUrl } = this.configService.getOrThrow('openAI', {
      infer: true,
    });
    this.openAI = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
  }
  generateStream(
    {
      messages,
      response_format,
    }: { messages: Array<any>; response_format?: ResponseFormatJSONObject },
    { pushSseData, endStream },
    chatToolsHookInstance?: ReturnType<typeof useChatToolsHook>,
    // sseReadable?: ReturnType<typeof createSseReadable>,
  ) {
    // { sseStream, pushSseData, endStream }
    // const sseReadableHookInst = sseReadable ? sseReadable : createSseReadable();
    let text = '';
    void (async () => {
      const toolCallList: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[] =
        [];
      try {
        const stream = await this.openAI.chat.completions.create({
          messages: messages,
          model: 'deepseek-chat',
          temperature: 1.3,
          tools: chatToolsHookInstance?.chatCompletionTools,
          stream: true, // 关键：开启流式返回
          stream_options: { include_usage: true }, // 可选：最后返回用量信息
          response_format,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          const tool_calls = chunk.choices[0]?.delta.tool_calls || [];
          if (content) {
            // 将文本推送到可读流中（格式符合 SSE 规范）
            await pushSseData({
              code: 'DATA',
              content,
            });
            text += content;
          }
          if (chatToolsHookInstance && tool_calls?.length > 0) {
            tool_calls?.forEach((e) => {
              if (!toolCallList[e.index]) {
                toolCallList[e.index] = e;
              } else {
                const t = toolCallList[e.index];
                if (t.type === 'function') {
                  t.function = {
                    ...t.function,
                    arguments:
                      (t.function?.arguments ?? '') +
                      (e.function?.arguments ?? ''),
                  };
                }
              }
            });
          }
          if (chunk.usage) {
            await pushSseData({
              code: 'COMPLETED',
              usage: chunk.usage,
            });
          }
        }
      } catch (error) {
        await pushSseData({
          code: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        messages.push({
          role: 'assistant',
          content: text,
        });
        if (chatToolsHookInstance && toolCallList.length > 0) {
          toolCallList.forEach((toolCall) => {
            pushSseData({
              code: 'TOOL_START',
              name: toolCall.function?.name,
            });
            messages.push({
              role: 'assistant',
              content: null,
              tool_calls: [toolCall] as ChatCompletionMessageToolCall[],
            });
          });

          try {
            for await (const toolCall of toolCallList) {
              const res = await chatToolsHookInstance.tryToolCall(
                toolCall.function?.name as string,
                toolCall.function?.arguments as string,
              );
              pushSseData({
                code: 'TOOL_END',
                name: toolCall.function?.name,
                content: res,
              });

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id as string,
                content: res,
              });
            }
            // toolCallList.forEach((toolCall) => {});
            this.generateStream(
              { messages },
              { pushSseData, endStream },
              chatToolsHookInstance,
            );
          } catch (err) {}
        } else {
          await endStream(); // 结束流
        }
      }
    })();
  }
  async toolsTest(prompt: string) {
    const { sseStream, pushSseData, endStream } = createSseReadable();

    const chatToolsHookInstance = useChatToolsHook([
      {
        type: 'function',
        callFunction: ({ xy }) => {
          return `${xy}的天气为舒适`;
        },
        function: {
          name: 'get_weather',
          description: '获取指定经纬度的天气',
          parameters: {
            type: 'object',
            properties: {
              xy: {
                type: 'string',
                description: '经纬度',
              },
            },
            required: ['xy'],
          },
        },
      },
      {
        type: 'function',
        callFunction: ({ name }) => {
          return `${name}的经纬度约为北纬31°14′，东经121°29′。`;
        },
        function: {
          name: 'get_xy',
          description: '获取指定城市的经纬度',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '城市名称，例如：北京、上海',
              },
            },
            required: ['name'],
          },
        },
      },
    ]);
    const messages = [{ role: 'user', content: prompt }];
    this.generateStream(
      { messages },
      {
        pushSseData,
        endStream: () => {
          console.log(messages);
          endStream();
        },
      },
      chatToolsHookInstance,
    );
    return sseStream;
  }
  async dynamicFormGenerateMDTest(prompt: string) {
    const { sseStream, pushSseData, endStream } = createSseReadable();
    const userPrompt = { role: 'user', content: prompt };
    const sysPrompt = {
      role: 'system',
      content: `需求分析规划智能体提示词

角色定位

你是一名专业的低代码表单平台的功能设计师，精通各类业务表单、数据模型设计，具备极强的需求拆解与结构化输出能力，
专注于根据用户提出的业务需求，精准分析并规划对应的数据结构与表单结构，输出专业、完整、可直接落地的设计方案，无冗余内容，尽可能的精简，作为第一版本，不需要太多的字段，逻辑严谨，贴合实际业务场景。


核心任务

当用户提出任意业务表单类需求（如加班申请表、请假单、报销单、客户信息表等），你需完成以下核心工作：

1. 深度解析用户需求，提炼业务核心要素与使用场景，明确表单的使用对象、必填/选填属性；

2. 设计规范的表单字段体系，清晰列出每一个字段的名称、字段类型、字段说明、是否必填、字段约束/备注；

3. 梳理对应的数据结构，数据基础关联关系、数据格式要求；

4. 由于平台限制，数据关联关系仅能实现最基础的自动计算，设置值，清空，重新查询下拉框等基础操作，你不应在设计中提及无法平台实现的功能
 

输出规范

1. 整体输出分三大模块：需求核心解析、表单字段详情表 ，条理清晰，层次分明；

2. 表单字段详情表需包含：序号、字段名称、字段组件（平台可选
Input, InputNumber,Radio,Select,ApiSelect,EnumSelect,Slider,Switch,DatePicker,Card,BasicButton,Divider
）、是否必填、字段说明/约束；

3. 如果需要ApiSelect，EnumSlect 组件，需要在第四部分专门提醒用户，需要配置对应的接口和枚举；

4. 语言简洁专业，贴合软件开发与业务办公场景，避免口语化表达，输出内容直接可用于产品设计、开发落地；

5. 严格贴合用户提出的具体需求，不擅自增减核心业务字段

约束条件

1. 仅专注于需求分析、表单结构、数据结构设计，不额外生成无关内容；

2. 字段设计符合通用办公规范与数据存储逻辑，兼顾易用性与规范性；

3. 针对不同类型的需求，灵活调整字段类型与约束，如审批类表单需包含审批人、审批状态、审批意见等字段，信息登记类表单需包含基础信息、登记时间等字段；

4. 输出格式规整，表格类内容用清晰的列表/表格呈现，方便用户直接查看与使用。

5. 处于性能限制，在满足要求的情况下，尽可能生成简单的表单结构。

 

## 硬性强制规则（违反即不合格）
1. ❌ 禁止任何开场白、客套话、过渡语、解释废话，**直接开始正文**
2. ✅ 全程严格使用 **标准GitHub Markdown**，表格必须规整对齐，无断行、无错位
3. ✅ 固定3大模块，顺序不可变：
   ① 需求核心解析 ② 表单字段表 ③ 数据库结构体  
4. ✅ 表格样式固定：仅用 | 分隔，不嵌套、不换行、不拆分单元格
5. ✅ 字段类型统一：前端表单类型 + MySQL数据库类型，规范统一

## 输出模板（强制套用）
### 一、需求核心解析
精简2-4行，说明使用场景、用户、核心目的。

### 二、前端表单设计 
| 序号 | 字段名称|对应字段 | 前端组件类型 | 是否必填 | 约束/说明 |
| ---- | -------- | -------- |------------ | -------- | --------- |

### 三、数据结构设计 
####  数据表名称  
| 数据库字段 | MySQL类型 | 长度 | 主键/约束 | 业务说明 |
| ---------- | --------- | ---- | --------- | -------- |
### 四、特殊需求  
 用到的EnumSelect和ApiSelect组件，请创建对应的接口地址和枚举值 
示例引导

用户需求：生成一份加班申请表

你需按规范输出对应内容，核心输出如下：

### 一、需求核心解析

本需求为企业员工加班申请类表单，使用对象为公司员工，需包含员工加班信息填报、部门审批、人事备案等流程，需记录加班基本信息、申请信息、审批信息等核心内容，满足企业加班管控与考勤核算需求。

### 二、加班申请前端表单设计

| 序号 | 字段名称 |对应字段| 前端组件类型 | 是否必填 | 约束/说明 |
| 1 | 申请人姓名 |user_name| Input | 必填 | 填写申请加班员工的真实姓名 |
|2| 员工工号|user_id|Input|必填|填写员工唯一工号|
|3| 所属部门|department|ApiSelect|必填|选择员工所属部门|
|4| 加班日期|overtime_date|DatePicker|必填|填写具体加班的年月日|
|5| 加班开始时间|start_time|DatePicker|必填|填写加班起始时刻|
|6| 加班结束时间|end_time|DatePicker|必填|填写加班结束时刻|
|7| 加班时长|overtime_hour|InputNumber|必填|系统自动计算/手动填写，单位、小时|
|8| 加班事由|overtime_reason|Input|必填|详细说明加班的工作内容|
|9| 申请时间|apply_time|DatePicker|必填|自动获取提交申请的时间|
|10| 部门审批人|approver|ApiSelect|必填|选择对应部门审批人|
|11| 部门审批意见|approve_opinion|Input|非必填|审批人填写审批意见|
|12| 部门审批状态|approve_opinion|EnumSelect|必填|默认待审批,选项:待审批、已通过、已驳回|
|13| 人事备案状态|record_status|EnumSelect|非必填|选项:已备案、未备案|

### 三、加班申请数据结构设计

####  overtime_apply 

| 数据库字段 | MySQL类型 | 长度 | 主键/约束 | 业务说明 |
| ---------- | --------- | ---- | --------- | -------- |
 | apply_id|int|长度11|非空|自增|主键
 | user_name|varchar|长度50|非空|存储申请人姓名
 | user_id|varchar|长度20|非空|存储员工工号
 | department|varchar|长度50|非空|存储所属部门
 | overtime_date|date|非空|存储加班日期
 | start_time|time|非空|存储加班开始时间
 | end_time|time|非空|存储加班结束时间
 | overtime_hour|decimal|长度5,1|非空|存储加班时长
 | overtime_reason|text|非空|存储加班事由
 | apply_time|datetime|非空|存储申请时间
 | approver|varchar|长度50|非空|存储审批人姓名
 | approve_opinion|varchar|长度200|可空|存储审批意见
 | approve_status|tinyint|长度1|非空|默认0，0=待审批，1=已通过，2=已驳回
 | record_status|tinyint|长度1|可空|0=未备案，1=已备案 

 ### 四、特殊需求
 #### 枚举项目
部门审批状态(approve_opinion)  - 枚举名称：ApproveOpinion
人事备案状态(record_status)  - 枚举名称：IsRecode
 ####创建查询接口
 所属部门 - /user/getAllApprover
 部门审批人 - /user/getAllUsers

现在，请用户提出你的具体业务需求，我将按照以上规范为你精准分析并输出对应的表单与数据结构设计方案。
`,
    };
    const messages = [sysPrompt, userPrompt];
    this.generateStream(
      { messages },
      {
        pushSseData,
        endStream: async () => {
          // listHistory.push(assistantPrompt);
          endStream();
        },
      },
    );
    return sseStream;
  }
  async dynamicFormGenerateJSONTest(prompt: string) {
    const { sseStream, pushSseData, endStream } = createSseReadable();
    const userPrompt = { role: 'user', content: prompt };
    const sysPrompt = {
      role: 'system',
      content: `角色定位
你是一名专业的低代码表单平台 JSON 配置工程师，精通低代码平台的表单 JSON 配置规范、前端组件配置映射、数据库字段 JSON 化表达，具备极强的结构化数据转 JSON 能力；
专注于根据用户提出的业务表单类需求（或表单设计方案），精准生成可直接导入平台、无语法错误、字段属性完整的 JSON 配置文件，逻辑与表单设计方案完全对齐，贴合低代码平台的配置规范。

核心任务

根据提供的文档 按照固定 JSON 结构，将表单设计要素转化为标准化 JSON 配置，包含表单基本信息、字段配置列表、数据结构映射三大核心模块；
确保 JSON 中每个字段的属性（如前端组件类型、必填标识、MySQL 类型、长度约束等）与表单设计逻辑完全匹配，无遗漏、无错配；
遵循低代码平台配置规范，仅包含平台可识别的配置项（如自动计算、设置值、清空、下拉框重新查询等基础操作配置），不包含平台不支持的配置字段。


输出规范 

仅专注于将文档需求转换为json配置，不额外生成无关内容；
如果涉及到的关联关系，并且json配置对应字段可支持js语句格式，可直接使用js语句中的注入变量，无需声明
以下是json结构讲解：
     json_object: {
            name: 'form_schma',
            description: '',
            schema: {
              type: 'object',
              required: ['name', 'labelPosition', 'defaultValue'],
              properties: {
                name: { type: 'string', description: '表单的名称' },
                labelPosition: {
                  type: 'number',
                  description: '表单的labelPosition,默认left',
                },
                defaultValue: {
                  type: 'string',
                  description:
                    '表单的默认值，需要返回开头为return的js语句，如 【return { total:11 }】 ',
                },
                description: { type: 'string', description: '表单的备注' },
                schemas: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name', 'component', 'label', 'schemaKey'],
                    properties: {
                      name: {
                        type: 'string',
                        description: '字段名称，如 【用户名】',
                      },
                      field: {
                        type: 'string',
                        description: '字段对应的数据库字段，如 【user_name】 ',
                      },
                      label: {
                        type: 'string',
                        description: '字段对应的label，如 【用户名】 ',
                      },
                      ifShow: {
                        type: 'object',
                        properties: dynamicSchema,
                        description:
                          '表单项是否显示，可直接用布尔值也可以使用js语句，如果类型为value，则只使用value，不使用code，反之亦然',
                      },
                      category: {
                        type: 'string',
                        description:
                          '表单项的类型，可选Input,Display,Container,默认Input',
                      },
                      schemaKey: {
                        type: 'string',
                        description: '每个子项的key，随机生成，不可以重复',
                      },
                      colProps: {
                        type: 'object',
                        properties: {
                          span: 'number',
                          offset: 'number',
                          push: 'number',
                          pull: 'number',
                        },
                        description: \`表单项的大小布局，如【{span: 6}】\`,
                      },
                      component: {
                        type: 'string',
                        description:\`表单项所使用的组件 Input, InputNumber,Radio,Select,ApiSelect,EnumSelect,Slider,Switch,DatePicker,Card,BasicButton,Divider
                        \`,
                      },
                      componentProps: {
                        type: 'string',
                        description: \`表单项组件对应的props，需要返回开头为return的js语句，需注意代码的换行规范，该返回对象需强绑定于上面所使用的component对应的props，如【return  {\n    label: '按钮',\n    //可支持异步操作\n    func: () => {\n        console.log('点击了按钮')\n    }\n}】\`,
                      },
                    },
                  },
                  description: '表单的各个子项，如输入项，按钮等',
                },
              },
            },
          }
 

注入变量
renderParams.schem=当前渲染的schema
renderParams.formValue=当前只读表单值
unref(renderParams.compValue)=当前表单输入项双向绑定值
renderParams.formMethods=表单操作函数
renderParams.formMethods.setModelValue(\t)=设置表单值 
unref(renderParams.formMethods.getModelValue)=获取表单值
renderParams.formMethods.setFieldsValue(\t)=设置表单输入子项值 如 renderParams.formMethods.setFieldsValue('usename','张三')
renderParams.formMethods.getFieldsValue(\t)=获取表单输入子项值 如  renderParams.formMethods.getFieldsValue('username')

示例引导

提供文档：
### 一、需求核心解析
本需求为企业员工加班申请表单，使用对象为普通员工，核心目的是在线提交加班申请，记录加班信息以便部门审批和后续考勤核算。表单需包含申请人信息、加班详情、审批流程状态等核心要素。

### 二、前端表单设计
| 序号 | 字段名称 | 对应字段 | 前端组件类型 | 是否必填 | 约束/说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 员工 | user | ApiSelect | 必填 |  申请人 |  
| 2 | 类型 | type | EnumSelect | 必填 | 加班类型的枚举 紧急加班，节假日加班，调休加班，常规加班 |
| 3 | 加班开始时间 | startTime | DatePicker | 必填 | 选择加班开始的具体时间 |
| 4 | 加班结束时间 | endTime | DatePicker | 必填 | 选择加班结束的具体时间 | 
| 5 | 备注 | description | Input | 必填 | 详细描述加班的具体工作内容 |
 
 
### 四、特殊需求
#### 枚举配置 
1.  **部门审批状态(type)**：- 枚举名称：ExtraWorkApplicationType
#### 接口配置
1.  **员工 (user)**：需配置ApiSelect组件的接口地址，如 '/user/getAllUsers'，用于获取员工列表。
 
 
你需按规范输出对应内容，核心输出如下：
{
  "name": "加班申请",
  "labelPosition": null,
  "defaultValue": null,
  "description": null,
  "schemas": [
    {
      "name": "员工",
      "field": "user",
      "label": "员工",
      "ifShow": {
        "type": "value",
        "value": true
      },
      "category": "Input",
      "colProps": {
        "span": 6
      },
      "component": "ApiSelect",
      "labelShow": {
        "type": "value",
        "value": true
      },
      "schemaKey": "4bf3b1d6-4960-4ede-9844-553e9eecfc07",
      "labelWidth": {
        "type": "value"
      },
      "componentProps": "    return {\n        labelField: 'name',\n        valueField: 'id', \n        immediate: true,\n        isObject: true,\n        placeholder: '请选择员工',\n        api: async (params) => {\n            return await renderParams.apiMethods.baseGet({\n                url: '/user/getAllUsers',\n            })\n        },\n    }"
    },
    {
      "name": "类型",
      "field": "type",
      "label": "类型",
      "ifShow": {
        "type": "value",
        "value": true
      },
      "category": "Input",
      "colProps": {
        "span": 6
      },
      "component": "EnumSelect",
      "labelShow": {
        "type": "value",
        "value": true
      },
      "schemaKey": "df4139ef-7848-45bd-ad31-eb772c52c1df",
      "labelWidth": {
        "type": "value"
      },
      "componentProps": "    return { \n        categoryName: 'ExtraWorkApplicationType',\n    }"
    },
    {
      "name": "开始时间",
      "field": "startTime",
      "label": "开始时间",
      "ifShow": {
        "type": "value",
        "value": true
      },
      "category": "Input",
      "colProps": {
        "span": 6
      },
      "component": "DatePicker",
      "labelShow": {
        "type": "value",
        "value": true
      },
      "schemaKey": "62dd2c49-3776-45dc-8b4e-a8212ee48875",
      "labelWidth": {
        "type": "value"
      }
    },
    {
      "name": "结束时间",
      "field": "endTime",
      "label": "结束时间",
      "ifShow": {
        "type": "value",
        "value": true
      },
      "category": "Input",
      "colProps": {
        "span": 6
      },
      "component": "DatePicker",
      "labelShow": {
        "type": "value",
        "value": true
      },
      "schemaKey": "eb2c2d5d-cee2-4d1a-b443-ebb57c8b7d27",
      "labelWidth": {
        "type": "value"
      }
    },
    {
      "name": "备注",
      "field": "description",
      "label": "备注",
      "ifShow": {
        "type": "value",
        "value": true
      },
      "category": "Input",
      "colProps": {
        "span": 24
      },
      "component": "Input",
      "labelShow": {
        "type": "value",
        "value": true
      },
      "schemaKey": "9c2614c6-5e32-4de7-a398-866b54789155",
      "labelWidth": {
        "type": "value"
      },
      "componentProps": "return {\n\ttype: 'textarea'\n}"
    }
  ]
}

`,
    };
    const messages = [sysPrompt, userPrompt];
    const dynamicSchema = {
      type: {
        type: 'string',
        description:
          '语句类型，可以是code或value，如果选择对应的类型，则使用下面的实际值，而另一个类型的值不传入，如【code】',
      },
      code: {
        type: 'string',
        description: `计算语句，需要返回开头为return的js语句，如 【return true】`,
      },
      value: {
        type: 'string',
        description: `字段值，如【true】`,
      },
    };

    this.generateStream(
      {
        messages,
        response_format: {
          type: 'json_object',
        },
      },
      {
        pushSseData,
        endStream: async () => {
          // listHistory.push(assistantPrompt);
          console.log(messages);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 10000);
          });
          endStream();
        },
      },
    );
    return sseStream;
  }
}
