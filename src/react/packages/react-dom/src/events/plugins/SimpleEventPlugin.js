/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DOMEventName} from '../../events/DOMEventNames';
import type {Fiber} from 'react-reconciler/src/ReactInternalTypes';
import type {AnyNativeEvent} from '../../events/PluginModuleType';
import type {DispatchQueue} from '../DOMPluginEventSystem';
import type {EventSystemFlags} from '../EventSystemFlags';

import {
  SyntheticEvent,
  SyntheticKeyboardEvent,
  SyntheticFocusEvent,
  SyntheticMouseEvent,
  SyntheticDragEvent,
  SyntheticTouchEvent,
  SyntheticAnimationEvent,
  SyntheticTransitionEvent,
  SyntheticUIEvent,
  SyntheticWheelEvent,
  SyntheticClipboardEvent,
  SyntheticPointerEvent,
} from '../../events/SyntheticEvent';

import {
  ANIMATION_END,
  ANIMATION_ITERATION,
  ANIMATION_START,
  TRANSITION_END,
} from '../DOMEventNames';
import {
  topLevelEventsToReactNames,
  registerSimpleEvents,
} from '../DOMEventProperties';
import {
  accumulateSinglePhaseListeners,
  accumulateEventHandleNonManagedNodeListeners,
} from '../DOMPluginEventSystem';
import {IS_EVENT_HANDLE_NON_MANAGED_NODE} from '../EventSystemFlags';

import getEventCharCode from '../getEventCharCode';
import {IS_CAPTURE_PHASE} from '../EventSystemFlags';

import {enableCreateEventHandleAPI} from 'shared/ReactFeatureFlags';

function extractEvents(
  dispatchQueue: DispatchQueue, // 待更新队列
  domEventName: DOMEventName, // 事件名
  targetInst: null | Fiber, // 对应DOM Fiber
  nativeEvent: AnyNativeEvent, // DOM事件
  nativeEventTarget: null | EventTarget, // 事件对应的DOM节点
  eventSystemFlags: EventSystemFlags, // 0冒泡  4捕获
  targetContainer: EventTarget,
): void {
  if (domEventName === 'click') debugger
  // 获取事件对应的react事件(驼峰命名) 例: click 事件在 react 中叫 onClick
  const reactName = topLevelEventsToReactNames.get(domEventName);
  if (reactName === undefined) {
    return;
  }
  let SyntheticEventCtor = SyntheticEvent; // 默认事件源
  let reactEventType: string = domEventName;
  // 根据事件获取对应的事件源
  switch (domEventName) {
    case 'keypress':
      // Firefox creates a keypress event for function keys too. This removes
      // the unwanted keypress events. Enter is however both printable and
      // non-printable. One would expect Tab to be as well (but it isn't).
      if (getEventCharCode(((nativeEvent: any): KeyboardEvent)) === 0) {
        return;
      }
    /* falls through */
    case 'keydown':
    case 'keyup':
      SyntheticEventCtor = SyntheticKeyboardEvent;
      break;
    case 'focusin':
      reactEventType = 'focus';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'focusout':
      reactEventType = 'blur';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'beforeblur':
    case 'afterblur':
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'click':
      // Firefox creates a click event on right mouse clicks. This removes the
      // unwanted click events.
      if (nativeEvent.button === 2) {
        return;
      }
    /* falls through */
    case 'auxclick':
    case 'dblclick':
    case 'mousedown':
    case 'mousemove':
    case 'mouseup':
    // TODO: Disabled elements should not respond to mouse events
    /* falls through */
    case 'mouseout':
    case 'mouseover':
    case 'contextmenu':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    case 'drag':
    case 'dragend':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'dragstart':
    case 'drop':
      SyntheticEventCtor = SyntheticDragEvent;
      break;
    case 'touchcancel':
    case 'touchend':
    case 'touchmove':
    case 'touchstart':
      SyntheticEventCtor = SyntheticTouchEvent;
      break;
    case ANIMATION_END:
    case ANIMATION_ITERATION:
    case ANIMATION_START:
      SyntheticEventCtor = SyntheticAnimationEvent;
      break;
    case TRANSITION_END:
      SyntheticEventCtor = SyntheticTransitionEvent;
      break;
    case 'scroll':
      SyntheticEventCtor = SyntheticUIEvent;
      break;
    case 'wheel':
      SyntheticEventCtor = SyntheticWheelEvent;
      break;
    case 'copy':
    case 'cut':
    case 'paste':
      SyntheticEventCtor = SyntheticClipboardEvent;
      break;
    case 'gotpointercapture':
    case 'lostpointercapture':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'pointerup':
      SyntheticEventCtor = SyntheticPointerEvent;
      break;
    default:
      // Unknown event. This is used by createEventHandle.
      break;
  }

  // 是否的捕获
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  if (
    enableCreateEventHandleAPI &&
    eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE
  ) {
    const listeners = accumulateEventHandleNonManagedNodeListeners(
      // TODO: this cast may not make sense for events like
      // "focus" where React listens to e.g. "focusin".
      ((reactEventType: any): DOMEventName),
      targetContainer,
      inCapturePhase,
    );
    if (listeners.length > 0) {
      // Intentionally create event lazily.
      const event = new SyntheticEventCtor(
        reactName,
        reactEventType,
        null,
        nativeEvent,
        nativeEventTarget,
      );
      dispatchQueue.push({event, listeners});
    }
  } else {
    // Some events don't bubble in the browser.
    // In the past, React has always bubbled them, but this can be surprising.
    // We're going to try aligning closer to the browser behavior by not bubbling
    // them in React either. We'll start by not bubbling onScroll, and then expand.
    //有些事件不会在浏览器中冒泡。
    //在过去，React总是让它们冒泡，但这可能令人惊讶。
    //我们将尝试通过不冒泡来更接近浏览器行为
    //他们也在React中。我们将从不在Scroll上冒泡开始，然后展开。
    const accumulateTargetOnly =
      !inCapturePhase &&
      // TODO: ideally, we'd eventually add all events from
      // nonDelegatedEvents list in DOMPluginEventSystem.
      // Then we can remove this special list.
      // This is a breaking change that can wait until React 18.
      domEventName === 'scroll';

    // 获取真正的执行函数
    const listeners = accumulateSinglePhaseListeners(
      targetInst, // 对应DOM 的 Fiber
      reactName, // react事件名
      nativeEvent.type, // Dom 事件名 例: click
      inCapturePhase, // 是否捕获
      accumulateTargetOnly, // 是否冒泡
      nativeEvent, // Dom事件
    );
    if (listeners.length > 0) {
      // Intentionally create event lazily.
      const event = new SyntheticEventCtor(
        reactName,
        reactEventType,
        null,
        nativeEvent,
        nativeEventTarget,
      );
      dispatchQueue.push({event, listeners});
    }
  }
}

export {registerSimpleEvents as registerEvents, extractEvents};
