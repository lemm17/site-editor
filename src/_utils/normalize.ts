import { IBaseFacade, IPlainTextFacade, SmartPath } from 'types';
import correctSmartIndexes from './actions/correctSmartIndexes';
import cloneSmartPathOfTargetAndIncrementIfNeed from './actions/incrementSmartPath';
import isPlainTextFacade from './plainTextActions/isPlainTextFacade';

export function normalizedTextChildren(
	children: IBaseFacade[],
	createPlainTextFacade: (
		smartPath: SmartPath,
		text?: string
	) => IPlainTextFacade
): IBaseFacade[] {
	const normalizedChildren: IBaseFacade[] = [];

	for (const [i, child] of children.entries()) {
		const isFirst = i === 0;

		if (isFirst) {
			if (isPlainTextFacade(child)) {
				normalizedChildren.push(child);
			} else {
				// Добавляем пустой текст перед инлайн-виджетом
				const smartPath = cloneSmartPathOfTargetAndIncrementIfNeed(
					child,
					false
				);
				const newEmptyPlainText = createPlainTextFacade(smartPath);
				normalizedChildren.push(newEmptyPlainText, child);
			}
			continue;
		}

		const lastElement = normalizedChildren.at(-1);

		if (isPlainTextFacade(lastElement)) {
			if (isPlainTextFacade(child)) {
				// Объединяем 2 одинаковых текстовых элемента
				// TODO: Нужно будет добавить сравнение на форматы
				// когда появится форматирование, иначе будут
				// объединяться без учета форматирования
				lastElement.insertTextForce(child.text, lastElement.text.length);
			} else {
				normalizedChildren.push(child);
			}
		} else {
			if (isPlainTextFacade(child)) {
				normalizedChildren.push(child);
			} else {
				// Если последний элемент и текущий - инлайн виджеты,
				// необходимо установить пустой плейн-текст между ними
				const smartPath = cloneSmartPathOfTargetAndIncrementIfNeed(
					child,
					false
				);
				const newEmptyPlainText = createPlainTextFacade(smartPath);
				normalizedChildren.push(newEmptyPlainText, child);
			}
		}
	}

	const lastElement = normalizedChildren.at(-1);

	if (!isPlainTextFacade(lastElement)) {
		const smartPath = cloneSmartPathOfTargetAndIncrementIfNeed(lastElement);
		const newEmptyPlainText = createPlainTextFacade(smartPath);
		normalizedChildren.push(newEmptyPlainText);
	}

	// Нормализуем индексы нормализованных элементов
	// Т. к. могли появиться новые элементы
	correctSmartIndexes(normalizedChildren, 0);

	return normalizedChildren;
}
