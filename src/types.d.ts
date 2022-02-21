import type { PromiseCopy } from './main' ;

export type Executor = ( 
        resolve : typeof PromiseCopy[ 'resolve' ], 
        reject : typeof PromiseCopy[ 'reject' ]
        ) => void

export type GenericCB = ( value : unknown ) => unknown ;

export type RemoveArgs< T >  = T extends ( ...args:any[] ) => infer X ? () => X : never ;

export type SettleHandler = {
    success: GenericCB,
    fail: GenericCB
}

export type ThenObject = {
    then: InstanceType<typeof PromiseCopy>[ 'then' ]
}