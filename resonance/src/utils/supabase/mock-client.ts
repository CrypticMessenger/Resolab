
const MOCK_USER = {
    id: 'demo-user-id',
    email: 'demo@resonance.ai',
    user_metadata: {
        full_name: 'Resonance Demo',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Resonance'
    },
    app_metadata: {
        provider: 'email',
        providers: ['email']
    },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString()
};

const mockAuth = {
    getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
    getSession: async () => ({ data: { session: { user: MOCK_USER, access_token: 'mock-token' } }, error: null }),
    onAuthStateChange: (callback: any) => {
        callback('SIGNED_IN', { user: MOCK_USER, access_token: 'mock-token' });
        return { data: { subscription: { unsubscribe: () => { } } } };
    },
    signInWithOAuth: async (...args: any[]) => ({ data: {}, error: null }),
    signOut: async () => {
        console.log('Mock signOut called');
        return { error: null };
    }
};

const mockQueryBuilder = {
    select: (...args: any[]) => mockQueryBuilder,
    insert: (...args: any[]) => mockQueryBuilder,
    update: (...args: any[]) => mockQueryBuilder,
    delete: (...args: any[]) => mockQueryBuilder,
    eq: (...args: any[]) => mockQueryBuilder,
    neq: (...args: any[]) => mockQueryBuilder,
    gt: (...args: any[]) => mockQueryBuilder,
    lt: (...args: any[]) => mockQueryBuilder,
    gte: (...args: any[]) => mockQueryBuilder,
    lte: (...args: any[]) => mockQueryBuilder,
    in: (...args: any[]) => mockQueryBuilder,
    is: (...args: any[]) => mockQueryBuilder,
    like: (...args: any[]) => mockQueryBuilder,
    ilike: (...args: any[]) => mockQueryBuilder,
    contains: (...args: any[]) => mockQueryBuilder,
    order: (...args: any[]) => mockQueryBuilder,
    limit: (...args: any[]) => mockQueryBuilder,
    single: async () => ({ data: null, error: null as any }),
    maybeSingle: async () => ({ data: null, error: null as any }),
    match: (...args: any[]) => mockQueryBuilder, // Added for potential usage
    not: (...args: any[]) => mockQueryBuilder,
    or: (...args: any[]) => mockQueryBuilder,
    filter: (...args: any[]) => mockQueryBuilder,
    then: (onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) => {
        return Promise.resolve({ data: [], error: null as any }).then(onfulfilled, onrejected);
    }
};

export const createClient = () => {
    return {
        auth: mockAuth,

        from: (table: string) => {
            console.log(`[MockDB] access table: ${table}`);

            // LOCAL STORAGE ADAPTER FOR PROJECTS
            if (table === 'projects' && typeof window !== 'undefined') {
                const getLocalData = () => {
                    const stored = localStorage.getItem('mock_db_projects');
                    return stored ? JSON.parse(stored) : [];
                };

                const saveLocalData = (data: any[]) => {
                    localStorage.setItem('mock_db_projects', JSON.stringify(data));
                };

                return {
                    ...mockQueryBuilder,
                    select: (...args: any[]) => {
                        return {
                            ...mockQueryBuilder,
                            eq: (col: string, val: any) => {
                                // Support simple user_id filtering or id filtering
                                let data = getLocalData();
                                if (col === 'user_id' || col === 'id') {
                                    data = data.filter((p: any) => p[col] === val);
                                }
                                return {
                                    ...mockQueryBuilder,
                                    order: () => ({ data, error: null }),
                                    single: async () => ({ data: data[0] || null, error: null }),
                                    then: (resolve: any) => resolve({ data, error: null })
                                }
                            },
                            order: () => ({ data: getLocalData(), error: null }), // Return all if no filter
                            then: (resolve: any) => resolve({ data: getLocalData(), error: null })
                        };
                    },
                    insert: (rows: any[]) => {
                        const projects = getLocalData();
                        const newRows = rows.map(r => ({ ...r, id: r.id || crypto.randomUUID(), updated_at: new Date().toISOString() }));
                        const updated = [...projects, ...newRows];
                        saveLocalData(updated);
                        return {
                            ...mockQueryBuilder,
                            select: () => ({
                                single: async () => ({ data: newRows[0], error: null }),
                                then: (resolve: any) => resolve({ data: newRows, error: null }) // Return inserted data
                            })
                        };
                    },
                    update: (updates: any) => ({
                        ...mockQueryBuilder,
                        eq: (col: string, val: any) => {
                            const projects = getLocalData();
                            const updated = projects.map((p: any) => p[col] === val ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
                            saveLocalData(updated);
                            return {
                                ...mockQueryBuilder,
                                select: () => ({
                                    single: async () => ({ data: updated.find((p: any) => p[col] === val), error: null })
                                }),
                                then: (resolve: any) => resolve({ data: null, error: null })
                            }
                        }
                    }),
                    delete: () => ({
                        ...mockQueryBuilder,
                        eq: (col: string, val: any) => {
                            const projects = getLocalData();
                            const updated = projects.filter((p: any) => p[col] !== val);
                            saveLocalData(updated);
                            return {
                                then: (resolve: any) => resolve({ data: null, error: null })
                            }
                        }
                    }),
                    upsert: (rows: any[]) => {
                        const projects = getLocalData();
                        const newRows = Array.isArray(rows) ? rows : [rows];
                        let updated = [...projects];

                        newRows.forEach(row => {
                            const index = updated.findIndex(p => p.id === row.id);
                            if (index >= 0) {
                                updated[index] = { ...updated[index], ...row, updated_at: new Date().toISOString() };
                            } else {
                                updated.push({ ...row, id: row.id || crypto.randomUUID(), updated_at: new Date().toISOString() });
                            }
                        });

                        saveLocalData(updated);
                        return {
                            ...mockQueryBuilder,
                            select: () => ({
                                single: async () => ({ data: newRows[0], error: null }),
                                then: (resolve: any) => resolve({ data: newRows, error: null })
                            })
                        };
                    }
                };
            }

            return mockQueryBuilder;
        },
        storage: {
            from: (bucket: string) => ({
                upload: async (...args: any[]) => ({ data: { path: 'mock-path' }, error: null as any }),
                getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
                download: async (...args: any[]) => ({ data: new Blob([]), error: null as any }),
                list: async (...args: any[]) => ({ data: [], error: null as any }),
                remove: async (...args: any[]) => ({ data: [], error: null as any }),
            })
        },
        rpc: async (...args: any[]) => ({ data: null, error: null as any }),
        channel: (name: string) => ({
            on: (...args: any[]) => ({
                subscribe: () => { }
            }),
            subscribe: () => { }
        }),
        removeChannel: (channel: any) => { }
    };
};
