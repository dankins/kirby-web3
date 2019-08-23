import * as React from "react";
import { CoreContext } from "@kirby-web3/child-react";
import { useSelector } from "react-redux";
import { SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { RouteComponentProps } from "@reach/router";

export const SignatureConfirm: React.FunctionComponent<RouteComponentProps> = () => {
  const maybeCore = React.useContext(CoreContext);
  const sig = maybeCore!.plugins.signatureInterceptor as SignatureInterceptorPlugin;

  const kirbyData = useSelector((state: any) => {
    return sig.getSignatureRequest();
  });

  function approveAction(): void {
    sig.approveAction();
  }
  function rejectAction(): void {
    sig.rejectAction();
  }
  return (
    <div>
      <small>signature requested:</small>
      <div>{kirbyData && kirbyData.plaintext}</div>
      <div>
        <button onClick={approveAction}>approve</button>
        <button onClick={rejectAction}>reject</button>
      </div>
    </div>
  );
};
