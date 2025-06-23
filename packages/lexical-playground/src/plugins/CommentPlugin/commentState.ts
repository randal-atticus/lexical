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
  $getState,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  $setState,
  createState,
  LexicalNode,
  ValueOrUpdater,
} from 'lexical';
import {isEqual, uniq} from 'lodash-es';

const commentIdsState = createState<string, string[] | null>('commentIds', {
  isEqual: (a, b) => isEqual(a, b),
  parse: (jsonValue) => {
    return jsonValue ? (jsonValue as string[]) : null;
  },
  unparse: (parsed) => {
    return parsed;
  },
});

export function $getCommentIdsState(node: LexicalNode): string[] | null {
  return $getState(node, commentIdsState);
}

function $setCommentIdsState<T extends LexicalNode>(
  node: T,
  valueOrUpdater: ValueOrUpdater<string[] | null>,
): T {
  return $setState(node, commentIdsState, valueOrUpdater);
}

export function $removeCommentIds(node: LexicalNode, commentIds: string[]) {
  $setState(node, commentIdsState, (existingCommentIds: string[] | null) => {
    if (!existingCommentIds || existingCommentIds.length === 0) {
      return null;
    }
    const newValue = existingCommentIds.filter(
      (id) => !commentIds.includes(id),
    );
    if (newValue.length === 0) {
      return null;
    }
    return newValue;
  });
}

export function $addCommentIdsToSelection(commentIds: string[]): boolean {
  let selection = $getSelection();
  if (!selection) {
    const prevSelection = $getPreviousSelection();
    if (!prevSelection) {
      return false;
    }
    selection = prevSelection.clone();
    $setSelection(selection);
  }

  const addCommentIdsUpdater = (prevCommentIds: string[] | null) => {
    return uniq([...(prevCommentIds ?? []), ...commentIds]);
  };

  if ($isRangeSelection(selection) && selection.isCollapsed()) {
    const node = selection.focus.getNode();
    if ($isTextNode(node)) {
      $setCommentIdsState(node, addCommentIdsUpdater);
    }
  } else {
    $forEachSelectedTextNode((node) =>
      $setCommentIdsState(node, addCommentIdsUpdater),
    );
  }
  return true;
}
