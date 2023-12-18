const endpoints: {
    path: string;
    method: string;
    isAdmin?: boolean;
    isLeader?: boolean;
}[] = [
    //user
    { path: '/user/me', method: 'get' },
    { path: '/user/', method: 'post' },

    //project
    { path: '/project/', method: 'get' },
    { path: '/project/sdfsfafa', method: 'get' },
    { path: '/project/', method: 'post' },
    {
        path: '/project/64eb59a48e26d74d56c67c81',
        method: 'delete',
        isLeader: true,
    },
    {
        path: '/project/64eb59a48e26d74d56c67c81',
        method: 'patch',
        isLeader: true,
    },
    {
        path: '/project/restore/64eb59a48e26d74d56c67c81',
        method: 'patch',
        isAdmin: true,
    },
    {
        path: '/project/addAccess/64eb59a48e26d74d56c67c81/:userId',
        isLeader: true,
        method: 'patch',
    },
    {
        path: '/project/removeAccess/64eb59a48e26d74d56c67c81/:userId',
        isLeader: true,
        method: 'patch',
    },
];
export default endpoints;
