/**
 * Determine whether the given `input` is iterable.
 *
 * @returns {Boolean}
 */
 export function isIterable(input: unknown): input is Iterable<unknown> {  
    if (input === null || typeof input !== 'object') {
      return false
    }

    if (input instanceof Array) return true;
  
    return typeof (input as Iterable<unknown>)[Symbol.iterator] === 'function'
}


export function mapObject<Index extends string, ValueBefore, ValueAfter>(
    obj: Record<Index, ValueBefore>,
    callbackfn: (value: ValueBefore, key: Index) => ValueAfter,
): {
    [key in Index]: ValueAfter
} {
    const result: Record<Index, ValueAfter> = {} as Record<Index, ValueAfter>;

    Object.entries(obj).forEach(
        ([key, value]) => {
            result[key as Index] = callbackfn(value as ValueBefore, key as Index);
        }
    );

    return result;
}

export function mapAny<ValueBefore, ValueAfter>(
    obj: Iterable<ValueBefore> | Record<string, ValueBefore>,
    callbackfn: (value: ValueBefore, key: string | number) => ValueAfter,
): ValueAfter[] | Record<string, ValueAfter>
{
    if (isIterable(obj)) {
        return Array.from(obj).map(callbackfn);
    }

    return mapObject(obj, callbackfn);
}