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
async function initMenu(extraWorkApplicationDynamicFormView) {
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
              routerPath: '/sys/dynamic/form/v2',
              url: '/sys/dynamic/form/v2',
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
          component: 'ApiSelect',
          labelShow: {
            type: 'value',
            value: true,
          },
          schemaKey: 'bce786b3-1517-40bf-abb6-8898224b86af',
          labelWidth: {
            type: 'value',
          },
          componentProps:
            "    return { \n        api: async (params) => {\n            const CategoryName = 'ExtraWorkApplicationType'\n            return ( await renderParams.apiMethods.getEnumCategory(CategoryName)).details\n        },\n        labelField: 'name',\n        valueField: 'value',\n    }",
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
  return {
    extraWorkApplicationDynamicForm,
  };
}
/**
 * 初始化轻代码表单表
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
  return { userDynamicTable, extraWorkApplicationDynamicTable };
}
async function initDynamicFormView(
  extraWorkApplicationDynamicTable,
  extraWorkApplicationDynamicForm,
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
  return { extraWorkApplicationDynamicFormView };
}
async function main() {
  const { testUser, adminUser } = await initUser();
  const { extraWorkApplicationTypeEnum } = await initEnum();
  const { extraWorkApplicationDynamicForm } = await initDynamicForm();
  const { userDynamicTable, extraWorkApplicationDynamicTable } =
    await initDynamicTable(extraWorkApplicationTypeEnum);
  const { extraWorkApplicationDynamicFormView } = await initDynamicFormView(
    extraWorkApplicationDynamicTable,
    extraWorkApplicationDynamicForm,
  );
  const { employeeMenu } = await initMenu(extraWorkApplicationDynamicFormView);
  const { testRole } = await initRole(testUser, employeeMenu);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
