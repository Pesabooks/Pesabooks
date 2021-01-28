/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, Subject } from "rxjs";
import { map, tap } from 'rxjs/operators';

export type AuthStateType = {
    isAuthenticated: boolean;
    user?: any;
};

let authStateSnapshot: AuthStateType = { isAuthenticated: false };

const authState = new BehaviorSubject<AuthStateType>(authStateSnapshot);

export const authState$ = authState.asObservable().pipe(tap((state) => {
    authStateSnapshot = state;
}));

export const isAuthenticated$ = authState.asObservable().pipe(map(state => state.isAuthenticated))

export const setUser = (user: any) => {
    if (user) {
        authStateSnapshot = { isAuthenticated: true, user };
    }
    else {
        authStateSnapshot = { isAuthenticated: false, };
    }
    authState.next(authStateSnapshot);
}