import { AbiItem } from "../model/abi.model";


export function getABIFor(abi: AbiItem[], methodName: string): AbiItem | void {
    return abi.find(({name}) => name === methodName)
}
