import {getRPCCode} from './get-rpc-code';

describe('getRPCCode', () => {
    it('empty string', () => {
        expect(getRPCCode('')).toBeNull();
    });

    it('string without object', () => {
        expect(getRPCCode('test str')).toBeNull();
    });

    it('empty object', () => {
        expect(getRPCCode('test str {}')).toBeNull();
    });

    it('incorrect object', () => {
        expect(
            getRPCCode('test str { "code": 1, "message": "msg" }')
        ).toBeNull();
    });

    it('incorrect data', () => {
        expect(
            getRPCCode(
                'test str { "code": 1, "message": "msg", "data": "test" }'
            )
        ).toBeNull();
    });

    it('correct string', () => {
        const string = `
        Internal JSON-RPC error.
            {
              "code": -32015,
              "message": "VM execution error.",
              "data": "Reverted 0x43414c4c5f524553554c54535f31"
            }
        `;

        expect(getRPCCode(string)).toEqual('CALL_RESULTS_1');
    });
});
