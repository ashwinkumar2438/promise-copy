import { isThenable } from './utils.js';

//types START:
import type { 
    Executor,
    GenericCB,
    RemoveArgs,
    SettleHandler
} from './types';


enum State {
    pending = 'PENDING',
    fulfilled = 'FULFILLED',
    rejected = 'REJECTED'
}

export type { PromiseCopy };

//types END:

class PromiseCopy{

    #state: State = State.pending ;
    #result?: unknown = undefined ;

    #handlers : SettleHandler[] = []

    #queued: boolean = false;

    //access value in instance:
    fulfilled?: unknown
    rejected?: unknown

    get state(){
        return this.#state ;
    }
    get result(){
        return this.#result ;
    }

    constructor( executer: Executor ){

        try{ 
            executer( PromiseCopy.resolve.bind( this ) , PromiseCopy.reject.bind( this ) );
        }
        catch( e ){
            PromiseCopy.reject.call( this, e );
        }
    }

    #dispatchCallbacks(){
        if( this.#state === State.pending )return ;
        if( this.#queued )return ;

        const method = this.#state === State.fulfilled ? 'success' : 'fail' ;

        queueMicrotask( () => {
            if( this.#state === State.rejected && !this.#handlers.length ) console.error( 'Uncaught (in promisecopy)', this.#result );
            
            for( let handler of this.#handlers ){
                handler[ method ]( this.#result ) ;
            }
            //cleanup:
            this.#handlers = [];
            this.#queued = false ;
            
        } );
        this.#queued = true ;

    }

    static resolve( value?:unknown ): InstanceType<typeof PromiseCopy> | undefined {

        if( !( this instanceof PromiseCopy ) )return new PromiseCopy( res => res( value ) );

        if( this.#state !== State.pending )return ; //return if promise settled.

        if( isThenable( value ) )return value.then( PromiseCopy.resolve.bind( this ), PromiseCopy.reject.bind( this ) );
        
        this.#state = State.fulfilled ;
        this.#result = value ;

        this.fulfilled = value ;

        this.#dispatchCallbacks();
    }

    static reject( value?: unknown ): InstanceType<typeof PromiseCopy> | undefined {

        if( !( this instanceof PromiseCopy ) )return new PromiseCopy( ( _, rej ) => rej( value ) );

        if( this.#state !== State.pending )return ; //return if promise settled.
        
        this.#state = State.rejected ;
        this.#result = value ;

        this.rejected = value ;

        this.#dispatchCallbacks();

        
    }


    then( successCB?: GenericCB, failCB?: GenericCB  ){
       
        return new PromiseCopy( ( res, rej ) => {

                this.#handlers.push( {
                    success( value: unknown ){
                        if( !successCB )return res( value );

                        try{
                            res( successCB( value ) );
                        }
                        catch( e ){
                            rej( e )
                        }
                    },
                    fail( error: unknown ){
                        if( !failCB )return rej( error );
                        
                        try{
                            res( failCB( error ) );
                        }
                        catch( e ){
                            rej( e )
                        }
                        
                    }
                 } );

                 this.#dispatchCallbacks();
        })

    }

    catch( failCB: GenericCB ){
        return this.then( undefined, failCB ) ;
    }


    finally( callback?: RemoveArgs< GenericCB > ){
        const successCB = ( value:unknown ) => {
            const response = callback?.() ;     
            return ( isThenable( response ) ) ? response.then( _ => value ) : value ;
        } 

        const errorCB = ( error: unknown ) => {
               const response = callback?.() ;
               const errorPromise = () => PromiseCopy.reject( error ); 
               return ( isThenable( response ) ) ? response.then( _ => errorPromise() ) : errorPromise() ; 
        }

        return this.then( successCB, errorCB );
    }

}

(window as any).PromiseCopy = PromiseCopy ;