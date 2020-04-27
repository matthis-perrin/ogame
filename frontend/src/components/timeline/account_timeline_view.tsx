// import React, {FC} from 'react';
// import styled from 'styled-components';

// import {Account} from '@shared/models/account';
// import {timeToString} from '@shared/models/time';
// import {AccountTimeline} from '@shared/models/timeline';

// import {BuildTransitionView} from '@src/components/timeline/build_transition_view';
// import {WaitTransitionView} from '@src/components/timeline/wait_transition_view';
// import {setAppState, useAppStore} from '@src/lib/store';

// export const AccountTimelineView: FC<{accountTimeline: AccountTimeline}> = ({accountTimeline}) => {
//   const {selectedAccount} = useAppStore();
//   const {computationTime, start, transitions} = accountTimeline;
//   const totalTime = transitions[transitions.length - 1]?.transitionnedAccount.currentTime ?? 0;
//   return (
//     <Wrapper>
//       <Header>
//         <Title>Timeline</Title>
//         <SubTitle>{`Total: ${timeToString(totalTime)}`}</SubTitle>
//         <SubTitle>{`Computation time: ${computationTime}ms`}</SubTitle>
//       </Header>
//       <div onClick={() => setAppState({accountTimeline, selectedAccount: start})}>
//         <AccountTime account={start}></AccountTime>
//       </div>
//       {transitions.map(({transition, transitionnedAccount}) => {
//         if (transition === undefined) {
//           throw new Error('Trying to render an AccountTimeline generated in perf mode');
//         }
//         const WrapperClass =
//           selectedAccount === transitionnedAccount
//             ? SelectedTransitionWrapper
//             : UnselectedTransitionWrapper;
//         return (
//           <WrapperClass
//             onClick={() => setAppState({accountTimeline, selectedAccount: transitionnedAccount})}
//             key={transition.id}
//           >
//             {transition.type === 'wait' ? (
//               <WaitTransitionView transition={transition} />
//             ) : (
//               <BuildTransitionView transition={transition} />
//             )}
//             <AccountTime account={transitionnedAccount} />
//           </WrapperClass>
//         );
//       })}
//     </Wrapper>
//   );
// };
// AccountTimelineView.displayName = 'AccountTimelineView';

// const Wrapper = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const Header = styled.div`
//   height: 96px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
// `;

// const Title = styled.div`
//   font-size: 20px;
//   margin-bottom: 4px;
// `;
// const SubTitle = styled.div`
//   font-size: 15px;
//   color: #aaa;
// `;

// const TransitionWrapper = styled.div``;

// const UnselectedTransitionWrapper = styled(TransitionWrapper)`
//   &:hover {
//     background-color: #ffffff15;
//     cursor: pointer;
//   }
// `;

// const SelectedTransitionWrapper = styled(TransitionWrapper)`
//   background-color: #ffffff30;
// `;

// export const AccountTime: FC<{account: Account}> = ({account}) => {
//   const {currentTime} = account;
//   return (
//     <TimeWrapper>{currentTime === 0 ? 'START' : `Time: ${timeToString(currentTime)}`}</TimeWrapper>
//   );
// };
// AccountTime.displayName = 'AccountTime';

// const TimeWrapper = styled.div`
//   height: 32px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-color: #ffffff33;
// `;

export const fixThis = true;
