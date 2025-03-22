import { IPlainTextFacade, ISelectionInfo } from 'types';
import { splitChildrenBySelection } from './split';
import removeWidget from './removeWidget';

export default function insertTextCrossWidget(
	text: string,
	selectionInfo: ISelectionInfo
): void {
	const { start, middle, end } = selectionInfo;

	const [leftPart, rightPart] = splitChildrenBySelection(selectionInfo);

	const middleLeftChild = leftPart.at(-1) as IPlainTextFacade;
	// Добавляем вставляемый текст в конец плейн-текст ноды в которой стоит стартовая каретка выделения
	middleLeftChild.insertText(text, middleLeftChild.text.length);

	// Удаляем все, что между выделением
	middle.forEach((widget) => {
		removeWidget(widget);
	});

	// Удаляем текстовый виджет конца выделения, если края выделения в разных текстовых виджетах
	if (start.text !== end.text) {
		removeWidget(end.text);
	}

	// Склеиваем левую часть текстого виджета старта с правой часть текстового виджета конца выделения
	start.text.children = [...leftPart, ...rightPart];
}
