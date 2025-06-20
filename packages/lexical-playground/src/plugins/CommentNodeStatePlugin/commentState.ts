/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {$forEachSelectedTextNode} from '@lexical/selection';
import {
  $getPreviousSelection,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  $setState,
  createState,
  LexicalNode,
  ValueOrUpdater,
} from 'lexical';

const commentIdState = createState('commentId', {
  isEqual: (a, b) => a === b,
  parse: (jsonValue) => {
    return jsonValue;
  },
  unparse: (parsed) => {
    return parsed;
  },
});

export function $setCommentIdState<T extends LexicalNode>(
  node: T,
  valueOrUpdater: ValueOrUpdater<string>,
): T {
  return $setState(node, commentIdState, valueOrUpdater);
}

export function $patchSelectedCommentId(commentId: string): boolean {
  let selection = $getSelection();
  if (!selection) {
    const prevSelection = $getPreviousSelection();
    if (!prevSelection) {
      return false;
    }
    selection = prevSelection.clone();
    $setSelection(selection);
  }

  if ($isRangeSelection(selection) && selection.isCollapsed()) {
    const node = selection.focus.getNode();
    if ($isTextNode(node)) {
      $setCommentIdState(node, commentId);
    }
  } else {
    $forEachSelectedTextNode((node) => $setCommentIdState(node, commentId));
  }
  return true;
}
