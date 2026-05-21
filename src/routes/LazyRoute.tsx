import { Suspense, type ComponentType, type ReactElement } from "react";
import LoadingScreen from "./LoadingScreen";

interface LazyRouteProps<TProps extends object = object> {
    component: ComponentType<TProps>;
    props?: TProps;
}

export default function LazyRoute<TProps extends object = object>({
    component: Component,
    props,
}: LazyRouteProps<TProps>): ReactElement {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Component {...(props as TProps)} />
        </Suspense>
    );
}
