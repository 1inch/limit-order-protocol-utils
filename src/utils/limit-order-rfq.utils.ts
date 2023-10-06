// #!/usr/bin/env node
//
// import prompts from 'prompts';
// import yargs from 'yargs';
// import {
//     cancelOrderSchema,
//     createOrderSchema,
//     fillOrderSchema,
//     operationSchema,
// } from './limit-order-rfq.const';
// import {OperationParams} from './limit-order-rfq.model';
// import {
//     cancelOrderOperation,
//     createOrderOperation,
//     fillOrderOperation,
// } from './limit-order-rfq.helpers';
//
// const allSchemas = [
//     cancelOrderSchema,
//     createOrderSchema,
//     fillOrderSchema,
//     operationSchema,
// ];
//
// (async () => {
//     const argvKeys = Object.keys(yargs.argv);
//     const isRunningWithArgv = allSchemas.some((schema) => {
//         return schema
//             .map((i) => i.name as string)
//             .every((param) => argvKeys.includes(param));
//     });
//
//     prompts.override(yargs.argv);
//
//     const operationResult = (await prompts(operationSchema)) as OperationParams;
//
//     switch (operationResult.operation) {
//         case 'create':
//             await createOrderOperation(isRunningWithArgv);
//             break;
//         case 'fill':
//             await fillOrderOperation(isRunningWithArgv);
//             break;
//         case 'cancel':
//             await cancelOrderOperation(isRunningWithArgv);
//             break;
//         default:
//             console.log('Unknown operation: ', operationResult.operation);
//             break;
//     }
// })();
