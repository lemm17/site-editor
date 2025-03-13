import { Setter, createSignal } from 'solid-js';
import { IBaseFacade } from 'types';

type Children = IBaseFacade[];
class ChildrenSetter {
	private _childrenToSetterMap = new WeakMap<Children, Setter<Children>>();

	getSetter(children: Children): Setter<Children> {
		return this._childrenToSetterMap.get(children);
	}

	_setSetter(children: Children, setter: Setter<Children>): void {
		this._childrenToSetterMap.set(children, setter);
	}
}

const childrenSetter = new ChildrenSetter();
export default childrenSetter;

export function createChildrenSignal(
	children: Children
): ReturnType<typeof createSignal<Children>> {
	const signal = createSignal(children);
	const [_, setter] = signal;

	const setterWrapper: Setter<Children> = ((
		...params: Parameters<Setter<Children>>
	) => {
		if (Array.isArray(params[0])) {
			const newChildren = params[0] as Children;
			childrenSetter._setSetter(newChildren, setterWrapper);
		}

		return setter(...params);
	}) as Setter<Children>;

	childrenSetter._setSetter(children, setterWrapper);

	return signal;
}
