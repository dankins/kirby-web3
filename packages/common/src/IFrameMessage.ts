// IFrame action types
export const CHILD_ALIVE = "ALIVE";
export const CHILD_RESPONSE = "RESPONSE";
export const CHILD_REJECT_REQUEST = "REJECT_REQUEST";
export const CHILD_SHOW_VIEW = "SHOW_VIEW";
export const CHILD_HIDE_VIEW = "HIDE_VIEW";
export const SEND_TO_PARENT = "SEND_TO_PARENT";
export const PARENT_OUTSIDE_CLICK = "PARENT_OUTSIDE_CLICK";

// CHILD TO PARENT
export interface ChildAliveAction {
  type: typeof CHILD_ALIVE;
  payload: {
    provides: string[];
  };
}

export interface ChildResponseAction {
  type: typeof CHILD_RESPONSE;
  requestID: number;
  payload: any;
}

export interface ChildRejectRequestAction {
  type: typeof CHILD_REJECT_REQUEST;
  requestID: number;
  payload: any;
}

export interface ChildShowView {
  type: typeof CHILD_SHOW_VIEW;
  payload: {};
}

export interface ChildHideView {
  type: typeof CHILD_HIDE_VIEW;
  payload: {};
}

export interface ChildSendToParent {
  type: typeof SEND_TO_PARENT;
  payload: {
    type: string;
    payload: any;
  };
}
export type ChildToParentMessage =
  | ChildAliveAction
  | ChildResponseAction
  | ChildRejectRequestAction
  | ChildShowView
  | ChildHideView
  | ChildSendToParent;
