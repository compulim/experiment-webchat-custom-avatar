/* eslint-disable @typescript-eslint/no-explicit-any */
import './WebChat.css';

import { Components, createStore, StyleOptions } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat-core';
import { memo, useEffect, useMemo, useState } from 'react';

import createDirectLineEmulator from '../util/createDirectLineEmulator';
import RenderAvatar from './RenderAvatar';

const { BasicWebChat, Composer } = Components;

type Props = Readonly<{ activities: readonly WebChatActivity[] }>;

export default memo(function Chat({ activities }: Props) {
  const [ready, setReady] = useState(false);
  const store = useMemo(
    () =>
      createStore({}, () => (next: (action: unknown) => unknown) => (action: { type: string }) => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          setReady(true);
        }

        return next(action);
      }),
    [setReady]
  );

  const { directLine } = useMemo(() => createDirectLineEmulator({ store }), [store]);

  const avatarMiddleware: any =
    () =>
    () =>
    // ({ activity, fromUser, ...otherArgs }: any) => {
    ({ activity }: any) => {
      console.log('Avatar Middleware - activity ' + JSON.stringify(activity));

      return () => <RenderAvatar activity={activity} />;
    };

  const styleOptions = useMemo<StyleOptions>(() => ({ botAvatarInitials: 'B' }), []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activities && ready && activities.forEach(activity => directLine.emulateIncomingActivity(activity));
  }, [activities, directLine, ready]);

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const { signal } = abortController;

      for (; !signal.aborted; ) {
        const { resolveAll } = await directLine.actPostActivity(() => {});

        if (signal.aborted) {
          break;
        }

        const echoBackActivity = await resolveAll();

        console.log(echoBackActivity);
      }
    })();

    return () => abortController.abort();
  }, [directLine]);

  return (
    <div className="chat">
      <Composer avatarMiddleware={avatarMiddleware} directLine={directLine} store={store} styleOptions={styleOptions}>
        <BasicWebChat />
      </Composer>
    </div>
  );
});
