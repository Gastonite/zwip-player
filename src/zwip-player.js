import { Animation, Loop } from 'zwip';
import Component from 'pwet/src/component';
import { renderElement, renderStyle, renderStrong, renderH3, renderPre, renderDiv, renderButton } from 'idom-util';
import { noop } from 'pwet/src/utilities';
import { patch, text } from 'incremental-dom';

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

internal.defaults = {
  makeAnimation(scene) {

    const element = scene.firstChild;

    const start = () => element.style.position = 'absolute';

    const render = () => element.style.left = `${(animation.value * (scene.clientWidth - element.clientWidth - 2) )}px`;

    const animation = Animation({ duration: 10000, start, render });

    return animation;
  },
  renderScene() {

    renderElement('h1', null, null, 'style', 'font-size:24px;', () => {
      text('DEFAULT SCENE');
    });

  }
};

internal.Player = (element, { renderScene, makeAnimation } = internal.defaults) => {

  let _loaded = false;
  let _animation = false;
  let _playAnimation = noop;
  let _reverseAnimation = noop;
  let _pauseAnimation = noop;
  let _stopAnimation = noop;

  let _isLoopStarted = false;
  let _isAnimationStarted = false;

  const _updateLoopState = () => {

    element.loopState = Loop.state;

    if (element.loopState.fps)
      element.loopState.fps = Math.round(element.loopState.fps * 1000) / 1000;

    let { value, nbFrames, duration, played, currentFrame } = _animation.state;

    element.animationState = {
      value: (!value ? 0 : Math.round(value * 100)) + '%',
      frames: `${currentFrame || 0}/${nbFrames}`,
      duration: `${played}/${duration}`,
    };

    component.render();
  };

  const _observer = new MutationObserver(() => {

    if (_loaded)
      return _observer.disconnect();

    _loaded = true;

    _animation = makeAnimation(element.querySelector('.scene'));
    _playAnimation = () => _animation.start({reverse: false});
    _reverseAnimation = () => _animation.start({reverse: true});
    _pauseAnimation = () => _animation.pause();
    _stopAnimation = () => _animation.stop();

    _animation.on('stop', () => _isAnimationStarted = false);
    _animation.on('start', () => _isAnimationStarted = true);

    Loop.on('start', () => _isLoopStarted = true);
    Loop.on('stop', () => _isLoopStarted = false);
    Loop.on(['pause', 'stop'], _updateLoopState);


    Loop.register({
      update: _updateLoopState,
      frequency: 10
    }, false);

    _updateLoopState();
  });

  _observer.observe(element, { childList: true, subtree: true });

  const render = (element, state) => {

    patch(element, () => {

      renderStyle(style.toString());

      renderDiv(null, null, 'class', 'left', () => {
        renderDiv(null, null, 'class', 'scene', renderScene);
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
          internal.renderObject(element.loopState);
          renderH3(text.bind(null, 'Animation state:'));
          internal.renderObject(element.animationState);
        });
        renderDiv(null, null, 'class', 'toolbar', () => {
          internal.renderControl('▶', Loop.start, !_isLoopStarted);
          internal.renderControl('▮▮', Loop.pause, _isLoopStarted);
          internal.renderControl('◼', Loop.stop, _isLoopStarted);
        })
      });

    });
  };

  const component = Component(internal.Player, element, { render });

  return component;
};

internal.Player.tagName = 'zwip-player';

internal.Player.shadowRoot = false;

internal.Player.attributes = {};

export default internal.Player;