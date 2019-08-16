import { ChildPlugin } from "./ChildPlugin";

export const REQUEST_VIEW_ACTION = "REQUEST_VIEW_ACTION";
export const COMPLETE_VIEW_ACTION = "COMPLETE_VIEW_ACTION";

export interface RequestViewAction {
  type: typeof REQUEST_VIEW_ACTION;
  payload: {
    route: string;
    requestID: string;
    dispatchOnComplete?: any;
  };
}

export interface CompleteViewAction {
  type: typeof COMPLETE_VIEW_ACTION;
  payload: {
    route: string;
    requestID: string;
    dispatchOnComplete?: any;
  };
}

export type ViewPluginActions = RequestViewAction;

export class ViewPlugin extends ChildPlugin<undefined, any, any> {
  public name = "view";

  public reducer(state: any = { queue: [] }, action: any): any {
    switch (action.type) {
      case REQUEST_VIEW_ACTION:
        return { ...state, queue: state.queue.concat(action.payload) };
      case COMPLETE_VIEW_ACTION:
        const nextQueue = [...state.queue.slice(0, 0), ...state.queue.slice(0 + 1)];
        return { ...state, queue: nextQueue };
    }

    return state;
  }

  public requestView(route: string, requestID?: string, dispatchOnComplete?: any): void {
    this.dispatch({ type: REQUEST_VIEW_ACTION, payload: { route, requestID, dispatchOnComplete } });
  }

  public completeView() {
    this.dispatch({ type: COMPLETE_VIEW_ACTION });
  }
}
