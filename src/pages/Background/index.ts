import { BackgroundMessage } from '../../messages';

/**
 * Listens to the app for message events to do actions that can only be done
 * in the background script.
 */
chrome.runtime.onMessage.addListener(async (message, sender, reply) => {
  switch (message.type) {
    case BackgroundMessage.SetPopupBadge:
      // Cannot open the popup automatically for the user to save the
      // password because this feature is still pending:
      // https://developer.chrome.com/docs/extensions/reference/action/#method-openPopup
      // So, for now, we change the badge on the browser to signify what
      // the user needs to do on their own.
      await chrome.action.setBadgeText({
        text: '1',
      });
      reply();
      break;
    case BackgroundMessage.RemovePopupBadge:
      await chrome.action.setBadgeText({
        text: '',
      });
      reply();
      break;
  }
});
