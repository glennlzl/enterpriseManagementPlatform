module.exports = {
  'GET /api/currentUser': {
    data: {
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      email: 'antdesign@alipay.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        { key: '0', label: '很有想法的' },
        { key: '1', label: '专注设计' },
        { key: '2', label: '辣~' },
        { key: '3', label: '大长腿' },
        { key: '4', label: '川妹子' },
        { key: '5', label: '海纳百川' },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      geographic: {
        province: { label: '浙江省', key: '330000' },
        city: { label: '杭州市', key: '330100' },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    },
  },
  'GET /api/rule': {
    data: [
      {
        id: 101,
        name: 'John Doe',
        userId: 'john.doe',
        avatar: 'https://example.com/avatar/john.png',
        stateCode: 'NY',
        managerId: 201,
        managerName: 'Jane Smith',
        managerUserId: 'jane.smith',
        mobile: '123-456-7890',
        telephone: '987-654-3210',
        jobNumber: 'E12345',
        title: 'Software Engineer',
        email: 'john.doe@example.com',
        workPlace: 'New York Office',
        remark: 'Key team member',
        orgEmail: 'john.doe@company.com',
        deptIdList: [10, 20],
        extension: '5678',
        hiredDate: new Date('2022-01-15').getTime(),
        role: 1,
        isAdmin: 0,
        isSenior: 1,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 0,
        token: 'abc123token',
      },
      {
        id: 102,
        name: 'Alice Johnson',
        userId: 'alice.johnson',
        avatar: 'https://example.com/avatar/alice.png',
        stateCode: 'CA',
        managerId: 202,
        managerName: 'Bob Brown',
        managerUserId: 'bob.brown',
        mobile: '234-567-8901',
        telephone: '876-543-2109',
        jobNumber: 'E12346',
        title: 'Product Manager',
        email: 'alice.johnson@example.com',
        workPlace: 'Los Angeles Office',
        remark: 'Experienced PM',
        orgEmail: 'alice.johnson@company.com',
        deptIdList: [30, 40],
        extension: '6789',
        hiredDate: new Date('2021-05-22').getTime(),
        role: 2,
        isAdmin: 0,
        isSenior: 1,
        isBoss: 0,
        isIncumbent: 0,
        isDeleted: 0,
        isUpdated: 0,
        token: 'def456token',
      },
      {
        id: 103,
        name: 'Michael Green',
        userId: 'michael.green',
        avatar: 'https://example.com/avatar/michael.png',
        stateCode: 'TX',
        managerId: 203,
        managerName: 'Cathy White',
        managerUserId: 'cathy.white',
        mobile: '345-678-9012',
        telephone: '765-432-1098',
        jobNumber: 'E12347',
        title: 'DevOps Engineer',
        email: 'michael.green@example.com',
        workPlace: 'Dallas Office',
        remark: 'Expert in cloud infrastructure',
        orgEmail: 'michael.green@company.com',
        deptIdList: [50],
        extension: '7890',
        hiredDate: new Date('2020-09-30').getTime(),
        role: 3,
        isAdmin: 1,
        isSenior: 1,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 0,
        token: 'ghi789token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
      {
        id: 104,
        name: 'Laura Brown',
        userId: 'laura.brown',
        avatar: 'https://example.com/avatar/laura.png',
        stateCode: 'FL',
        managerId: 204,
        managerName: 'David Black',
        managerUserId: 'david.black',
        mobile: '456-789-0123',
        telephone: '654-321-0987',
        jobNumber: 'E12348',
        title: 'UX Designer',
        email: 'laura.brown@example.com',
        workPlace: 'Miami Office',
        remark: 'Passionate about user experience',
        orgEmail: 'laura.brown@company.com',
        deptIdList: [60, 70],
        extension: '8901',
        hiredDate: new Date('2019-11-10').getTime(),
        role: 4,
        isAdmin: 0,
        isSenior: 0,
        isBoss: 0,
        isIncumbent: 1,
        isDeleted: 0,
        isUpdated: 1,
        token: 'jkl012token',
      },
    ],
  },
  'POST /api/login/outLogin': { data: {}, success: true },
  'POST /api/login/account': {
    status: 'ok',
    type: 'account',
    currentAuthority: 'admin',
  },
};
