// import { hooks } from 'botframework-webchat';

// const { useStyleOptions } = hooks;

const RenderAvatar = ({ activity }: { activity: { channelData?: { activityOrigin: string } } }) => {
  // const [styleOptions] = useStyleOptions();

  return (
    <img
      src={
        activity.channelData?.activityOrigin == 'GenerativeContentSkill'
          ? 'assets/images/02.png'
          : 'assets/images/01.png'
      }
    />
  );
};

export default RenderAvatar;
