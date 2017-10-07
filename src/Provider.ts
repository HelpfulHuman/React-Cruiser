import * as React from "react";
import * as cruiser from "cruiser";

declare const process;

export interface ProviderProps {
  store: cruiser.Store<any>;
  storeKey?: string;
}

export interface ProviderContext {
  [key: string]: cruiser.Store<any>;

}

export class Provider extends React.PureComponent<ProviderProps, any> {

  private store: cruiser.Store<any>;

  static defaultProps = {
    storeKey: "store",
  };

  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  getChildContext(): ProviderContext {
    var { storeKey } = this.props;
    return {
      [storeKey]: this.store,
    };
  }

  componentWillReceiveProps(nextProps: ProviderProps) {
    if (process.env.NODE_ENV !== "production") {
      if (this.store !== nextProps.store) {
        console.warn("You cannot provide a new Store after you've initialized a Provider.");
      }
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }

}