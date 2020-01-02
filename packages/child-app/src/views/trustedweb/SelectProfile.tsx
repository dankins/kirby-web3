import * as React from "react";
import styled from "styled-components";
import makeBlockie from "ethereum-blockies-base64";

import { Profile } from "@kirby-web3/plugin-trustedweb";
import { Button } from "../../common/Button";

export interface SelectProfileProps {
  profiles: Profile[];
  createProfile(name: string): Promise<Profile>;
  onProfileSelected(profile: Profile): Promise<Profile>;
}

enum statuses {
  INIT,
  CHANGE_START,
  CHANGE_DONE,
  CREATE_START,
  CREATE_DONE,
}

export const SelectProfile: React.FunctionComponent<SelectProfileProps> = ({
  profiles,
  createProfile,
  onProfileSelected,
}) => {
  const [, setStatus] = React.useState<statuses>(statuses.INIT);
  const nameRef = React.useRef<any>(null);

  const blockies = React.useMemo(() => {
    if (!profiles) {
      return [];
    }
    return profiles.map(acct => makeBlockie(acct.address));
  }, [profiles]);

  async function doCreateProfile(): Promise<void> {
    if (nameRef === null) {
      throw new Error("null ref");
    }

    const value = nameRef.current.value;
    setStatus(statuses.CREATE_START);
    await createProfile(value);
    setStatus(statuses.CREATE_DONE);
    nameRef.current.value = "";
  }

  async function changeProfile(profile: Profile): Promise<void> {
    setStatus(statuses.CHANGE_START);
    await onProfileSelected(profile);
    setStatus(statuses.CHANGE_DONE);
  }

  if (!profiles) {
    return <div>loading profiles...</div>;
  }
  if (profiles.length === 0) {
    return (
      <div>
        <div>you don't have any profiles yet</div>
        <div>enter your profile name:</div>
        <input type="text" ref={nameRef} />
        <button onClick={doCreateProfile}>Create Profile</button>
      </div>
    );
  }
  return (
    <div>
      <div>Select Profile to Use</div>
      {profiles.map((profile, idx) => (
        <ProfileItem
          key={profile.address}
          profile={profile}
          onSelect={() => changeProfile(profile)}
          blockie={blockies[idx]}
        />
      ))}
      <div>
        <div>or create a new profile:</div>
        <input type="text" ref={nameRef} />
        <button onClick={doCreateProfile}>Create Profile</button>
      </div>
    </div>
  );
};

const ProfileItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px;
  align-items: center;
  :hover {
    background-color: #dfdfdf;
  }
  > :nth-child(2) {
    flex-grow: 1;
  }
  > img {
    padding: 0 5px;
  }
`;

export interface ProfileItemProps {
  profile: Profile;
  blockie: string;
  onSelect(): void;
}
export const ProfileItem: React.FunctionComponent<ProfileItemProps> = ({ profile, blockie, onSelect }) => {
  return (
    <ProfileItemContainer>
      <img src={blockie} height={35} width={35} alt={profile.address} />
      <span>{profile.name}</span>
      <Button onClick={onSelect}>select</Button>
    </ProfileItemContainer>
  );
};
