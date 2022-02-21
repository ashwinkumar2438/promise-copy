import type { ThenObject } from './types' ;

const isThenable = ( value: unknown ): value is ThenObject =>{
    return ( value instanceof Object ) && ( ( <ThenObject>value ).then instanceof Function );
};

export { isThenable } ;