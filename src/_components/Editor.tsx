import { children, For, Show, onMount } from 'solid-js';
import {
	WIDGETS,
	IWidgetComponentProps,
	IWidgetComponent,
	IFrameFacade,
	IBaseFacade,
	IWidgetFacade,
	IPlainTextFacade,
} from 'types';
import { createChildrenSignal, isPlainTextFacade } from 'utils';
import { EditorContext } from 'context';

interface IEditorProps {
	frameFacade: IFrameFacade;
	componentMap: Record<WIDGETS, IWidgetComponent>;
}

export default function Editor({ frameFacade, componentMap }: IEditorProps) {
	const editorContext = {
		frameFacade,
		cursorOffset: null,
	};
	return (
		<EditorContext.Provider value={editorContext}>
			<div class='editor'>
				<RecursiveRender
					children={frameFacade.children}
					componentMap={componentMap}
				/>
			</div>
		</EditorContext.Provider>
	);
}

interface IRecursiveRenderProps {
	children: IBaseFacade[];
	componentMap: Record<WIDGETS, IWidgetComponent>;
}

function RecursiveRender({ children, componentMap }: IRecursiveRenderProps) {
	const [getChildren] = createChildrenSignal(children);

	return (
		<Show when={getChildren().length > 0}>
			<For each={getChildren()}>
				{(child) => {
					return (
						<ComponentWrapper
							value={child as IWidgetFacade}
							componentMap={componentMap}
						>
							<RecursiveRender
								children={child.children}
								componentMap={componentMap}
							/>
						</ComponentWrapper>
					);
				}}
			</For>
		</Show>
	);
}

interface IComponentWrapperProps<T extends object = {}>
	extends IWidgetComponentProps<T> {
	value: IWidgetFacade<T>;
	componentMap: Record<WIDGETS, IWidgetComponent>;
}

const RENDER = 'render';
const RENDER_VISIBLE = 'render-visible';
const RENDER_CLASS = `${RENDER} ${RENDER_VISIBLE}`;
const offRender = () =>
	setTimeout(() => {
		document
			.querySelectorAll(`.${RENDER}`)
			.forEach((el) => el.classList.remove(RENDER_VISIBLE));
	}, 500);

function ComponentWrapper<T extends object = {}>(
	props: IComponentWrapperProps<T>
) {
	const { value, componentMap } = props;
	const resolvedChildren = children(() => props.children);
	const Component = componentMap[value.type];

	onMount(() => offRender());

	if (isPlainTextFacade(value as unknown as IPlainTextFacade)) {
		const plainTextFacade = value as unknown as IPlainTextFacade;
		const getText = plainTextFacade._createTextSignal();

		return (
			<span
				class={RENDER_CLASS}
				data-inline={'true'}
				id={plainTextFacade.id}
			>
				{getText()}
			</span>
		);
	}

	if (value.isInline) {
		return (
			<span
				class={RENDER_CLASS}
				// Если вставить false как boolean, SolidJS его вырежет
				contentEditable={'false' as unknown as boolean}
				id={value.id}
				data-inline={'true'}
			>
				<Component value={value}>{resolvedChildren()}</Component>
			</span>
		);
	}

	return (
		<div class={RENDER_CLASS} data-inline={'false'} id={value.id}>
			<Component value={value}>{resolvedChildren()}</Component>
		</div>
	);
}
