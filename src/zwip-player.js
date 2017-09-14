import { Animation, Zwip } from 'zwip';
import { object } from 'pwet/src/attribute';
import { renderElement, renderStyle, renderStrong, renderHeading, renderPre, renderDiv, renderButton } from 'idom-util';
import { assert } from 'kwak';
import { noop } from 'pwet/src/utilities';
import StatefulComponent from 'pwet/src/decorators/stateful';
import { isAnimation } from 'zwip/src/utils';
import { patch, text, skipNode } from 'incremental-dom';



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

internal.ZwipPlayer = (component) => {

  const { element } = component;

  console.log('ZwipPlayer()', component, element);

  let _loaded = false;
  let _animation = false;
  let _playAnimation = noop;
  let _reverseAnimation = noop;
  let _pauseAnimation = noop;
  let _stopAnimation = noop;

  let _isZwipStarted = false;
  let _isAnimationStarted = false;

  const _updateZwipState = () => {

    const { state } = component;

    const loopState = Zwip.state;

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

    Zwip.on('start', () => _isZwipStarted = true);
    Zwip.on('stop', () => _isZwipStarted = _isAnimationStarted = false);
    Zwip.on(['pause', 'stop', 'tick'], _updateZwipState);
    Zwip.on('tick', () => _isZwipStarted = true);

    _updateZwipState();
  });

  _observer.observe(element, { childList: true, subtree: true });

  const render = () => {

    const { state, element, isRendered } = component;
    const { renderScene } = element.properties;
    const { loopState, animationState } = state;

    console.log('ZwipPlayer.render()');

    patch(element, () => {

      renderStyle(internal.ZwipPlayer.style.toString());

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
          renderHeading(3, text.bind(null, 'Zwip state:'));
          internal.renderObject(loopState);
          renderHeading(3, text.bind(null, 'Animation state:'));
          internal.renderObject(animationState);
        });
        renderDiv(null, null, 'class', 'toolbar', () => {
          internal.renderControl('▶', Zwip.start, !_isZwipStarted);
          internal.renderControl('▮▮', Zwip.pause, _isZwipStarted);
          internal.renderControl('◼', Zwip.stop, _isZwipStarted);
        })
      });
    });
  };

  return { render };
};


internal.ZwipPlayer.decorators = [StatefulComponent];

internal.ZwipPlayer.tagName = 'zwip-player';

internal.ZwipPlayer.shadowRoot = false;

internal.ZwipPlayer.initialState = {
  animationState: {},
  loopState: {},
};

internal.ZwipPlayer.properties = {
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

export default internal.ZwipPlayer;
