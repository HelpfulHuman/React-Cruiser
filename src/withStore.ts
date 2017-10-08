import * as React from "react";
import * as cruiser from "cruiser";
import { ProviderContext } from "./Provider";

export interface PickPropsFunction<T, U> {
  (state: T, ownProps: U): object;
}

export interface BindActionsFunction<T> {
  (reduce: cruiser.Reducer<object>): object;
  (reduce: cruiser.Reducer<T>): object;
}

export interface HigherOrderComponentFactory {
  (Component: React.Component<any, any>): React.Component<any, any>;
}

function defaultBindActionsToProps<T>(reduce: cruiser.Reducer<T>): object {
  return { reduce };
}

/**
 * Connects a React component with a store passed via the Context
 * object by a <Provider> component in the parent hierarchy.
 *
 * This is analogous to React-Redux's connect() method.
 */
export function withStore<T, U>(
  pickPropsFromState: PickPropsFunction<T, U>,
  bindActionsToProps: BindActionsFunction<T> = defaultBindActionsToProps
): HigherOrderComponentFactory {
  return function (Component: React.Component): any {
    return class extends React.Component<any, any> {

      static displayName = `CruiserConnected(${Component})`;

      static defaultProps = {
        storeKey: "store",
      };

      boundActions: object;

      store: cruiser.Store<object>;

      constructor(props: any, context: ProviderContext) {
        super(props, context);
        this.store = context[props.storeKey];
        this.handleUpdate = this.handleUpdate.bind(this);
        this.boundActions = bindActionsToProps(this.store.reduce);
      }

      handleUpdate(): void {
        this.forceUpdate();
      }

      componentWillMount(): void {
        this.store.subscribe(this.handleUpdate);
      }

      componentWillUnmount(): void {
        // TODO: Use the returned "unsubscribe()" method instead
        this.store.unsubscribe(this.handleUpdate);
      }

      render(): JSX.Element {
        var { children, ...ownProps } = this.props;
        var stateFromStore = this.store.getState() as any;
        var propsFromStore = pickPropsFromState(stateFromStore, ownProps);
        var boundActions = this.boundActions;

        return (
          <Component
            {...ownProps}
            {...boundActions}
            {...propsFromStore}>
            {children}
          </Component>
        );
      }
    };
  };
}