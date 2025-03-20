export { default as createUUID } from './_utils/uuid';
export {
	default as constructFrameFacade,
	createWidgetFacadeConstructors,
	createPlainTextFacade,
} from './_utils/constructFrameFacade';
export { default as createBubbleEventFunc } from './_utils/createBubbleEventFunc';
export {
	default as ChildrenSetter,
	createChildrenSignal,
} from './_utils/ChildrenSetter';
export { default as toFrame, widgetToFrame } from './_utils/toFrame';
export { default as isCollapsed } from './_utils/selection/isCollapsed';
export { default as detection } from './_utils/detection';
export { default as applySelection } from './_utils/selection/applySelection';
export {
	default as computeSelection,
	computeOffset,
	facadeContainsSelection,
	computeTextOffsetByOffsetX,
	computeAnchorOffset,
} from './_utils/selection/computeSelection';
export { default as shouldLetOutCursor } from './_utils/selection/shoudLetOutCursor';
export { default as CFDFSTraverse } from './_utils/CFDFSTraverse';
export { isTextNode } from './_utils/selection/textNodes';
export { default as isPlainTextFacade } from './_utils/plainTextActions/isPlainTextFacade';
export { default as insertTextPlain } from './_utils/plainTextActions/insertText';
export { default as correctSmartIndexes } from './_utils/actions/correctSmartIndexes';
export { default as getEdgesInfo } from './_utils/actions/getEdgesInfo';
export { default as insertTextCrossWidget } from './_utils/actions/insertTextCrossWidget';
export { default as getWFByPath } from './_utils/actions/getWFByPath';
export { splitChildrenByTarget } from './_utils/actions/split';
export { default as cloneSmartPathOfTargetAndIncrementIfNeed } from './_utils/actions/incrementSmartPath';
export { default as highlightJSON } from './_utils/highlightJSON';
export { default as deleteContent } from './_utils/actions/deleteContent';
export { default as insertText } from './_utils/actions/insertText';
export { default as addWidget } from './_utils/actions/addWidget';
export { default as insertParagraph } from './_utils/actions/insertParagraph';
export { default as removeWidget } from './_utils/actions/removeWidget';
export { default as mergeText } from './_utils/actions/mergeText';
export { normalizedTextChildren } from './_utils/normalize';
export { default as computeTextLength } from './_utils/computeTextLength';
export { default as isRightTextPathOf } from './_utils/isRightTextPathOf';
export { default as computeSelectedWidgets } from './_utils/selection/computeSelectedWidgets';
