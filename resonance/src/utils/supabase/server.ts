import { createClient as createMockClient } from './mock-client'

export async function createClient(options?: { admin?: boolean }) {
    return createMockClient()
}

