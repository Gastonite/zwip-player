import { Animation, Loop } from 'zwip';
import { object } from 'pwet/src/attribute';
import { renderElement, renderStyle, renderStrong, renderH3, renderPre, renderDiv, renderButton } from 'idom-util';
import { assert } from 'pwet/src/assertions';
import { noop } from 'pwet/src/utilities';
import { isAnimation } from 'zwip/src/utils';
import { patch, text, skipNode } from 'incremental-dom';

import style from '!css-loader!stylus-loader!./zwip-player.styl';


const internal = {};

internal.renderControl = (content, action, isEnabled = true) => {
  const args = [null, null, 'onmouseup', action];

  if (!isEnabled)
    args.push('disabled', true);

  renderButton(...args, text.bind(null, content));
};

internal.renderObject = (object = {}) => {
  Object.keys(object).forEach(key => {

    renderDiv(() => {
      renderStrong(null, null, 'style', 'display:inline-block;width:90px', text.bind(null, key+':\t\t'));
      renderPre(text.bind(null, object[key]));
    });
  });
};

internal.Player = (component) => {

  const { element } = component;

  console.log('ZwipPlayer()');

  let _loaded = false;
  let _animation = false;
  let _playAnimation = noop;
  let _reverseAnimation = noop;
  let _pauseAnimation = noop;
  let _stopAnimation = noop;

  let _isLoopStarted = false;
  let _isAnimationStarted = false;

  const _updateLoopState = () => {

    const { state } = component;

    const loopState = Loop.state;

    if (loopState.fps)
      loopState.fps = Math.round(loopState.fps * 1000) / 1000;

    let { value, nbFrames, duration, played, currentFrame } = _animation.state;

    const animationState = {
      value: (!value ? 0 : Math.round(value * 100)) + '%',
      frames: `${currentFrame || 0}/${nbFrames}`,
      duration: `${played}/${duration}`,
    };

    component.state = Object.assign(state, {
      loopState,
      animationState
    });
  };

  const _observer = new MutationObserver(() => {

    if (_loaded)
      return _observer.disconnect();

    _loaded = true;

    _animation = element.makeAnimation(element.querySelector('.scene'));

    assert(isAnimation(_animation), `'makeAnimation' did not return a Zwip animation`);

    _playAnimation = () => _animation.start({reverse: false});
    _reverseAnimation = () => _animation.start({reverse: true});
    _pauseAnimation = () => _animation.pause();
    _stopAnimation = () => _animation.stop();

    _animation.on('stop', () => _isAnimationStarted = false);
    _animation.on('start', () => _isAnimationStarted = true);

    Loop.on('start', () => _isLoopStarted = true);
    Loop.on('stop', () => _isLoopStarted = _isAnimationStarted = false);
    Loop.on(['pause', 'stop', 'tick'], _updateLoopState);
    Loop.on('tick', () => _isLoopStarted = true);

    _updateLoopState();
  });

  _observer.observe(element, { childList: true, subtree: true });

  const render = () => {

    const { state, properties, isRendered } = component;
    const { renderScene } = properties;
    const { loopState, animationState } = state;

    console.log('ZwipPlayer.render()');

    patch(element, () => {

      renderStyle(style.toString());

      renderDiv(null, null, 'class', 'left', () => {
        renderDiv(null, null, 'class', 'scene', () => {

          if (isRendered)
            return skipNode();

          renderScene()
        });
        renderDiv(null, null, 'class', 'toolbar', () => {
          internal.renderControl('◀', _reverseAnimation, !_isAnimationStarted);
          internal.renderControl('▶', _playAnimation, !_isAnimationStarted);
          internal.renderControl('▮▮', _pauseAnimation, _isAnimationStarted);
          internal.renderControl('◼', _stopAnimation, _isAnimationStarted);
        });
      });

      renderDiv(null, null, 'class', 'right', () => {
        renderElement('div', null, null, () => {
          renderH3(text.bind(null, 'Loop state:'));
          internal.renderObject(loopState);
          renderH3(text.bind(null, 'Animation state:'));
          internal.renderObject(animationState);
        });
        renderDiv(null, null, 'class', 'toolbar', () => {
          internal.renderControl('▶', Loop.start, !_isLoopStarted);
          internal.renderControl('▮▮', Loop.pause, _isLoopStarted);
          internal.renderControl('◼', Loop.stop, _isLoopStarted);
        })
      });
    });
  };

  return { render };
};

internal.Player.tagName = 'zwip-player';

internal.Player.shadowRoot = false;

internal.Player.initialState = {
  animationState: {},
  loopState: {},
};

internal.Player.properties = {
  makeAnimation(scene) {

    const title = scene.firstChild;

    title.style.position = 'absolute';

    const render = () => title.style.left = `${(animation.value * (scene.clientWidth - title.clientWidth - 2) )}px`;

    const animation = Animation({ duration: 5000, render, easing: 'easeOutCirc' });

    return animation;
  },
  renderScene() {

    renderElement('h1', null, null, 'style', 'font-size:24px;', () => {
      text('DEFAULT SCENE');
    });

  }
};

export default internal.Player;
