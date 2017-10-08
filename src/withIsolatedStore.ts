import * as React from "react";
import * as cruiser from "cruiser";
import { BindActionsFunction, HigherOrderComponentFactory } from "./withStore";

function defaultBindActionsToProps<T>(reduce: cruiser.Reducer<T>): object {
  return { reduce };
}

/**
 * HigherOrderComponent for creating a store that is coupled
 * strictly to the component.  Uses the React setState() method
 * under the hood rather than creating an actual Cruiser store
 * in order to reduce un-neccessary overhead.
 */
export function withIsolatedStore<T extends object>(
  initialStateModel: T,
  mapActionsToProps: BindActionsFunction<T> = defaultBindActionsToProps
): HigherOrderComponentFactory {
  return function (Component) {
    return class extends React.PureComponent<any, any> {

      state: T;

      boundActions: object;

      constructor(props, context) {
        super(props, context);
        this.state = initialStateModel;
        this.reduce = this.reduce.bind(this);
        this.boundActions = mapActionsToProps(this.reduce);
      }

      reduce(newState: T): object;
      reduce(newState: object): object;
      reduce(newState) {
        this.setState(newState);
        return this.state as object;
      }

      render() {
        var { children, ...ownProps } = this.props;
        var boundActions = this.boundActions;

        return (
          <Component
            {...ownProps}
            {...boundActions}>
            {children}
          </Component>
        );
      }

    } as any;
  };
}