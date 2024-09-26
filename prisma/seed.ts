import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
/**
 * 初始化枚举表
 */
async function initEnum() {
  const extraWorkApplicationTypeEnum = await prisma.enumCategory.create({
    data: {
      name: 'ExtraWorkApplicationType',
      title: '加班申请类型',
      details: {
        create: [
          {
            name: '常规加班',
            value: 'Regular',
          },
          {
            name: '节假日加班',
            value: 'Holiday',
          },
          {
            name: '紧急加班',
            value: 'Emergency',
          },
          {
            name: '调休加班',
            value: 'Compensatory',
          },
        ],
      },
    },
  });
  return {
    extraWorkApplicationTypeEnum,
  };
}

/**
 * 初始化账号表
 */
async function initUser() {
  /**
   * 创建管理员账号
   */
  const adminUser = await prisma.user.create({
    data: {
      userNo: 'admin',
      name: '系统管理员',
      password: '$2a$10$VUW1lXE7dHWdMl87P7ZWs.jLtk870sciNiWynLe4vlIdHDk4Hytka',
      isAdmin: true,
    },
  });
  /**
   * 创建测试账号
   */
  const testUser = await prisma.user.create({
    data: {
      userNo: 'test',
      name: '测试用户',
      password: '$2a$10$VUW1lXE7dHWdMl87P7ZWs.jLtk870sciNiWynLe4vlIdHDk4Hytka',
    },
  });
  return { testUser, adminUser };
}
/**
 * 初始化菜单表
 */
async function initMenu({
  extraWorkApplicationDynamicFormView,
  textCollectionDynamicFormView,
}) {
  /**
   * 创建管理员菜单
   */
  const adminMenu = await prisma.menu.create({
    data: {
      name: '管理员',
      type: 'Group',
      isEnabled: true,
      sort: 1,
      subMenus: {
        createMany: {
          data: [
            {
              name: '菜单管理',
              type: 'View',
              routerPath: '/sys/admin/menu',
              url: '/sys/admin/menu',
              isEnabled: true,
            },
            {
              name: '角色管理',
              type: 'View',
              routerPath: '/sys/admin/role',
              url: '/sys/admin/role',
              isEnabled: true,
            },
            {
              name: '枚举管理',
              type: 'View',
              routerPath: '/sys/admin/enum',
              url: '/sys/admin/enum',
              isEnabled: true,
            },
            {
              name: '文本收录管理',
              type: 'DynamicFormView',
              dynamicFormViewId: textCollectionDynamicFormView.id,
              routerPath: '/sys/admin/textCollection',
              isEnabled: true,
            },
          ],
        },
      },
    },
  });
  /**
   * 创建轻代码菜单
   */
  const dynamicMenu = await prisma.menu.create({
    include: { subMenus: true },
    data: {
      name: '轻代码',
      type: 'Group',
      isEnabled: true,
      sort: 2,
      subMenus: {
        createMany: {
          data: [
            {
              name: '数据表管理',
              type: 'View',
              routerPath: '/sys/dynamic/table',
              url: '/sys/dynamic/table',
              isEnabled: true,
            },
            {
              name: '表单管理',
              type: 'View',
              routerPath: '/sys/dynamic/form',
              url: '/sys/dynamic/form',
              isEnabled: true,
            },
            {
              name: '视图组件管理',
              type: 'View',
              routerPath: '/sys/dynamic/viewComp',
              url: '/sys/dynamic/viewComp',
              isEnabled: true,
            },
          ],
        },
      },
    },
  });
  /**
   * 创建菜单
   */
  const employeeMenu = await prisma.menu.create({
    include: { subMenus: true },
    data: {
      name: '员工自助',
      type: 'Group',
      isEnabled: true,
      sort: 3,
      subMenus: {
        createMany: {
          data: [
            {
              name: '加班申请',
              type: 'DynamicFormView',
              dynamicFormViewId: extraWorkApplicationDynamicFormView.id,
              routerPath: '/dynamic/extraWorkApplication',
              isEnabled: true,
            },
          ],
        },
      },
    },
  });
  return { adminMenu, dynamicMenu, employeeMenu };
}
/**
 * 初始化角色表
 */
async function initRole(testUser, employeeMenu) {
  /**
   * 创建测试角色并关联测试账号
   */
  const testRole = await prisma.role.create({
    data: {
      name: '员工',
      description: '通用权限角色',
      users: {
        connect: { id: testUser.id },
      },
      menus: {
        connect: [
          { id: employeeMenu.id },
          ...employeeMenu.subMenus.map((subMenu) => ({ id: subMenu.id })),
        ],
      },
    },
  });
  return { testRole };
}
/**
 * 初始化轻代码表单表
 */
async function initDynamicForm() {
  const extraWorkApplicationDynamicForm = await prisma.dynamicForm.create({
    data: {
      name: '加班申请',
      beforeSubmit: `    return (data)=> {
        console.log('保存参数', data)
        return data
    }`,
      schemas: [
        {
          name: '员工',
          field: 'user',
          label: '员工',
          ifShow: {
            type: 'value',
            value: true,
          },
          category: 'Input',
          colProps: {
            span: 6,
          },
          component: 'ApiSelect',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: '4bf3b1d6-4960-4ede-9844-553e9eecfc07',
          labelWidth: {
            type: 'value',
          },
          componentProps:
            "    return {\n        labelField: 'name',\n        valueField: 'id', \n        immediate: true,\n        isObject: true,\n        placeholder: '请选择员工',\n        api: async (params) => {\n            return await renderParams.apiMethods.baseGet({\n                url: '/user/getAllUsers',\n            })\n        },\n    }",
        },
        {
          name: '类型',
          field: 'type',
          label: '类型',
          ifShow: {
            type: 'value',
            value: true,
          },
          category: 'Input',
          colProps: {
            span: 6,
          },
          component: 'EnumSelect',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: 'df4139ef-7848-45bd-ad31-eb772c52c1df',
          labelWidth: {
            type: 'value',
          },
          componentProps:
            "    return { \n        categoryName: 'ExtraWorkApplicationType',\n    }",
        },
        {
          name: '开始时间',
          field: 'startTime',
          label: '开始时间',
          ifShow: {
            type: 'value',
            value: true,
          },
          category: 'Input',
          colProps: {
            span: 6,
          },
          component: 'DatePicker',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: '62dd2c49-3776-45dc-8b4e-a8212ee48875',
          labelWidth: {
            type: 'value',
          },
        },
        {
          name: '结束时间',
          field: 'endTime',
          label: '结束时间',
          ifShow: {
            type: 'value',
            value: true,
          },
          category: 'Input',
          colProps: {
            span: 6,
          },
          component: 'DatePicker',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: 'eb2c2d5d-cee2-4d1a-b443-ebb57c8b7d27',
          labelWidth: {
            type: 'value',
          },
        },
        {
          name: '备注',
          field: 'description',
          label: '备注',
          ifShow: {
            type: 'value',
            value: true,
          },
          category: 'Input',
          colProps: {
            span: 24,
          },
          component: 'Input',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: '9c2614c6-5e32-4de7-a398-866b54789155',
          labelWidth: {
            type: 'value',
          },
          componentProps: "return {\n\ttype: 'textarea'\n}",
        },
      ],
    },
  });
  const textCollectionDynamicForm = await prisma.dynamicForm.create({
    data: {
      name: '文本收录',
      labelPosition: 'top',
      schemas: [
        {
          category: 'Input',
          name: '角色',
          component: 'Input',
          schemaKey: '2df18c4a-3e3f-4833-af7d-d4e197dcd6e4',
          ifShow: {
            type: 'value',
            value: true,
          },
          colProps: {
            span: 6,
          },
          field: 'author',
          label: '角色',
          labelShow: {
            type: 'value',
            value: true,
          },
          labelWidth: {
            type: 'value',
          },
        },
        {
          category: 'Input',
          name: '出处',
          component: 'Input',
          schemaKey: '21191ab9-0dbb-43ed-bd5b-295b3663043f',
          ifShow: {
            type: 'value',
            value: true,
          },
          colProps: {
            span: 6,
          },
          field: 'source',
          label: '出处',
          labelShow: {
            type: 'value',
            value: true,
          },
          labelWidth: {
            type: 'value',
          },
        },
        {
          category: 'Input',
          name: '内容',
          component: 'Input',
          componentProps: "return {\n\ttype: 'textarea'\n}",
          schemaKey: '7e13e24d-d6b7-451d-9fb3-cbee01dca549',
          ifShow: {
            type: 'value',
            value: true,
          },
          colProps: {
            span: 24,
          },
          field: 'text',
          label: '内容',
          labelShow: {
            type: 'value',
            value: true,
          },
          labelWidth: {
            type: 'value',
          },
        },
        {
          category: 'Input',
          name: '备注',
          component: 'Input',
          componentProps: "return {\n\ttype: 'textarea'\n}",
          schemaKey: 'a8cd1807-60f0-4403-9492-64b2608acc28',
          ifShow: {
            type: 'value',
            value: true,
          },
          colProps: {
            span: 24,
          },
          field: 'description',
          label: '备注',
          labelShow: {
            type: 'value',
            value: true,
          },
          labelWidth: {
            type: 'value',
          },
        },
      ],
    },
  });
  return {
    extraWorkApplicationDynamicForm,
    textCollectionDynamicForm,
  };
}
/**
 * 初始化轻代码数据表
 */
async function initDynamicTable(extraWorkApplicationTypeEnum) {
  const userDynamicTable = await prisma.dynamicTable.create({
    data: {
      name: '用户表',
      tableName: 'User',
      cols: {
        create: [
          {
            name: 'userNo',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'name',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'email',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'phone',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'createdAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
          {
            name: 'updatedAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
        ],
      },
    },
  });
  const extraWorkApplicationDynamicTable = await prisma.dynamicTable.create({
    data: {
      name: '加班申请表',
      tableName: 'ExtraWorkApplication',
      cols: {
        create: [
          {
            name: 'user',
            colType: 'SubTable',
            canQuery: true,
            canWritable: true,
            subTableType: 'ToOne',
            subTableId: userDynamicTable.id,
            subTableWritableStrategy: 'ConnectById',
            subTableQueryStrategy: 'FullObject',
            fission: [
              {
                toKey: 'userName',
                formKey: 'name',
              },
            ],
          },
          {
            name: 'type',
            colType: 'Enum',
            canQuery: true,
            canWritable: true,
            enumCategoryId: extraWorkApplicationTypeEnum.id,
            fission: [
              {
                toKey: 'typeName',
                formKey: 'name',
              },
            ],
          },
          {
            name: 'startTime',
            colType: 'DateTime',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'endTime',
            colType: 'DateTime',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'description',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'createdAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
          {
            name: 'updatedAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
        ],
      },
    },
  });
  const textCollectionDynamicTable = await prisma.dynamicTable.create({
    data: {
      name: '文本收录表',
      tableName: 'TextCollection',
      cols: {
        create: [
          {
            name: 'author',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'source',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'text',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'description',
            colType: 'String',
            canQuery: true,
            canWritable: true,
          },
          {
            name: 'createdAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
          {
            name: 'updatedAt',
            colType: 'DateTime',
            canQuery: true,
            canWritable: false,
          },
        ],
      },
    },
  });
  return {
    userDynamicTable,
    extraWorkApplicationDynamicTable,
    textCollectionDynamicTable,
  };
}
async function initDynamicFormView(
  { extraWorkApplicationDynamicTable, textCollectionDynamicTable },
  { extraWorkApplicationDynamicForm, textCollectionDynamicForm },
) {
  const extraWorkApplicationDynamicFormView =
    await prisma.dynamicFormViewComp.create({
      data: {
        name: '加班申请',
        dataSourceType: 'DynamicTable',
        dynamicTable: {
          connect: { id: extraWorkApplicationDynamicTable.id },
        },
        formSourceType: 'DynamicForm',
        dynamicForm: {
          connect: { id: extraWorkApplicationDynamicForm.id },
        },
        tableColumns: [
          {
            prop: 'userName',
            label: '员工',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'typeName',
            label: '类型',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'startTime',
            label: '开始时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'endTime',
            label: '结束时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'description',
            label: '备注',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'createdAt',
            label: '创建时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'updatedAt',
            label: '编辑时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
        ],
      },
    });
  const textCollectionDynamicFormView = await prisma.dynamicFormViewComp.create(
    {
      data: {
        name: '文本收录',
        dataSourceType: 'DynamicTable',
        dynamicTable: {
          connect: { id: textCollectionDynamicTable.id },
        },
        formSourceType: 'DynamicForm',
        dynamicForm: {
          connect: { id: textCollectionDynamicForm.id },
        },
        tableColumns: [
          {
            prop: 'text',
            label: '内容',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'author',
            label: '角色',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'source',
            label: '出处',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'description',
            label: '备注',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'createdAt',
            label: '创建时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
          {
            prop: 'updatedAt',
            label: '编辑时间',
            width: '',
            transform: '',
            showOverflowTooltip: false,
          },
        ],
      },
    },
  );
  return { extraWorkApplicationDynamicFormView, textCollectionDynamicFormView };
}
async function initDynamicTableRecored() {
  await prisma.textCollection.createMany({
    data: [
      {
        source: '孤独摇滚',
        text: '要是舍弃了个性，就跟死去没有两样',
        author: '山田凉',
      },
      {
        text: '世界上只有一种真正的英雄主义,那就是认清生活真相后依旧热爱生活',
        author: '罗曼·罗兰',
      },
      {
        text: '我认为教育小孩子”世界上没有黑暗“是一件非常糟糕的事情',
        author: '虚渊玄',
      },
      {
        source: '魔法少女小圆',
        text: '太过善良有时候可能会换来更大的悲伤',
        author: '巴麻美',
      },
      {
        source: 'JOJO的奇妙冒险',
        text: '人的成长就是战胜过去不成熟的自己',
        author: '迪亚波罗',
      },
      {
        source: '命运石之门',
        text: '这一切都是命运石之门的选择',
        author: '冈部伦太郎',
      },
      {
        source: 'JOJO的奇妙冒险',
        text: '两个囚徒从监狱的窗口里向外看，一个凝视着泥土，一个仰望着星空',
      },
      {
        source: '进击的巨人',
        text: '什么都无法舍弃的人，什么都改变不了',
        author: '阿尔敏',
      },
      {
        source: '弹丸论破',
        text: '规矩，既是束缚，也是保护',
      },
      {
        source: '弹丸论破',
        text: '最终能幸存下来的人，既不是强者，也不是智者，而是能适应变化的人',
      },
      {
        source: '魔法少女小圆',
        text: '比希望更炙热，比绝望更深邃的，是爱啊',
        author: '晓美焰',
      },
      {
        source: '脑叶公司',
        text: '即便这是施加于我的诅咒，我也会将它当成祝福一样热爱',
      },
      {
        source: '脑叶公司',
        text: '那么，正于此地，愿您找到想要的书',
        author: '安吉拉',
      },
      {
        source: '脑叶公司',
        text: '拥抱过去，创造未来',
      },
      {
        source: '阿里云',
        text: '为了无法计算的价值',
      },
      {
        source: '人狼村之谜',
        text: '即便如此，也要追求狼的胜利',
        author: '房石阳明',
      },
    ],
  });
}
async function main() {
  const { testUser, adminUser } = await initUser();
  const { extraWorkApplicationTypeEnum } = await initEnum();
  const { extraWorkApplicationDynamicForm, textCollectionDynamicForm } =
    await initDynamicForm();
  const {
    userDynamicTable,
    extraWorkApplicationDynamicTable,
    textCollectionDynamicTable,
  } = await initDynamicTable(extraWorkApplicationTypeEnum);
  const { extraWorkApplicationDynamicFormView, textCollectionDynamicFormView } =
    await initDynamicFormView(
      { extraWorkApplicationDynamicTable, textCollectionDynamicTable },
      { extraWorkApplicationDynamicForm, textCollectionDynamicForm },
    );
  const { employeeMenu } = await initMenu({
    extraWorkApplicationDynamicFormView,
    textCollectionDynamicFormView,
  });
  const { testRole } = await initRole(testUser, employeeMenu);
  await initDynamicTableRecored();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
