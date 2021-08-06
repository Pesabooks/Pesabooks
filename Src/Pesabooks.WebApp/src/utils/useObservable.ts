import { useEffect, useState } from "react";
import { Observable } from "rxjs";


const useObservable = <T>(observable: Observable<T>): T => {
    const [state, setState] = useState<T>();

    useEffect(() => {
        const sub = observable.subscribe(setState);
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
}

export default useObservable;