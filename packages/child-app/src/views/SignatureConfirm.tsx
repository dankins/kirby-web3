import * as React from "react";
import { CoreContext, useSelector, CenteredPage } from "@kirby-web3/child-react";
import { SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { RouteComponentProps } from "@reach/router";
import { ViewPlugin } from "@kirby-web3/child-core";

export const SignatureConfirm: React.FunctionComponent<RouteComponentProps> = () => {
  const ctx = React.useContext(CoreContext);
  const sig = ctx.core.plugins.signatureInterceptor as SignatureInterceptorPlugin;

  React.useEffect(() => {
    (ctx.core.plugins.view as ViewPlugin).onParentClick(() => {
      sig.rejectAction();
    });
  }, [ctx.core.plugins.view, sig]);

  const plaintext = useSelector((state: any) => {
    if (state.signatureInterceptor.requests && state.signatureInterceptor.requests[0]) {
      return state.signatureInterceptor.requests[0].plaintext;
    }
  });

  return (
    <CenteredPage>
      <small>signature requested:</small>
      <div>{plaintext}</div>
      <div>
        <button onClick={() => sig.approveAction()}>approve</button>
        <button onClick={() => sig.rejectAction()}>reject</button>
      </div>
    </CenteredPage>
  );
};
