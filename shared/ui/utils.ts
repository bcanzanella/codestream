import * as uuidv4 from "uuid/v4";

export function isInVscode() {
	return !!document.querySelector("body.codestream");
}

export function capitalize([first, ...rest]) {
	return first.toUpperCase() + rest.join("");
}

export const safe = <T>(fn: () => T): T | undefined => {
	try {
		return fn();
	} catch (e) {
		return undefined;
	}
};

export function mapFilter<A, B>(array: A[], fn: (A) => B | undefined): B[] {
	const result: B[] = [];
	array.forEach(a => {
		const mapped = fn(a);
		if (mapped) {
			result.push(mapped);
		}
	});
	return result;
}

export const findLast = (array: any[], fn: (any) => boolean): any | undefined => {
	for (let i = array.length - 1; i >= 0; i--) {
		const item = array[i];
		if (fn(item)) return item;
	}
};

export const rangeTo = (size: number) => [...Array(size).keys()];

export const debounceToAnimationFrame = (fn: Function) => {
	let result: any;
	let requestId: number | undefined;

	return function(...args: any[]) {
		if (requestId) {
			cancelAnimationFrame(requestId);
		}
		requestId = requestAnimationFrame(() => {
			requestId = undefined;
			result = fn(args);
		});
		return result;
	};
};

export const rAFThrottle = (fn: Function): Function => {
	let requestId: number | undefined;
	let lastArgs: any[] = [];

	const throttledFn = function(...args: any[]) {
		lastArgs = args;
		if (requestId) {
			console.debug(`rAFThrottle is throttling a call to ${fn}. new args are`, args);
			return;
		}
		requestId = requestAnimationFrame(() => {
			requestId = undefined;
			fn(...lastArgs);
		});
	};

	throttledFn.cancel = () => {
		if (requestId) cancelAnimationFrame(requestId);
	};

	return throttledFn;
};

export function toMapBy<Key extends keyof T, T>(key: Key, entities: T[]): { [key: string]: T } {
	return entities.reduce(function(map, entity) {
		map[entity[key]] = entity;
		return map;
	}, Object.create(null));
}

export const uuid = uuidv4;
export const shortUuid = () => {
	const data = new Uint8Array(16);
	uuidv4(null, data, 0);

	const base64 = btoa(String.fromCharCode.apply(null, data));
	return base64
		.replace(/\+/g, "-") // Replace + with - (see RFC 4648, sec. 5)
		.replace(/\//g, "_") // Replace / with _ (see RFC 4648, sec. 5)
		.substring(0, 22); // Drop '==' padding;
};

export const isChildOf = (node: any, parentId: string) => {
	while (node !== null) {
		if (node.id === parentId) {
			return true;
		}
		node = node.parentNode;
	}

	return false;
};

export const getCurrentCursorPosition = (parentId: string) => {
	let selection = window.getSelection(),
		charCount = -1,
		node: any;

	// console.log(selection);
	if (selection.focusNode) {
		if (isChildOf(selection.focusNode, parentId)) {
			node = selection.focusNode;
			charCount = selection.focusOffset;

			while (node) {
				if (node.id === parentId) {
					break;
				}

				if (node.previousSibling) {
					node = node.previousSibling;
					charCount += node.textContent.length;
				} else {
					node = node.parentNode;
					if (node === null) {
						break;
					}
				}
			}
		}
	}
	return charCount;
};

export const createRange = (node: any, chars: any, range: any) => {
	if (!range) {
		range = document.createRange();
		range.selectNode(node);
		range.setStart(node, 0);
	}

	if (chars.count === 0) {
		range.setEnd(node, chars.count);
	} else if (node && chars.count > 0) {
		if (node.nodeType === Node.TEXT_NODE) {
			if (node.textContent.length < chars.count) {
				chars.count -= node.textContent.length;
			} else {
				range.setEnd(node, chars.count);
				chars.count = 0;
			}
		} else {
			for (let lp = 0; lp < node.childNodes.length; lp++) {
				range = createRange(node.childNodes[lp], chars, range);

				if (chars.count === 0) {
					break;
				}
			}
		}
	}

	return range;
};

export function componentDidUpateMixin<Props, State>(context, fn: (Props, State) => any) {
	return prevProps => {
		const name = context.constructor.displayName || context.constructor.name || "Component";
		console.group(name);
		console.debug("props", { prevProps, currProps: context.props });
		Object.keys(prevProps).forEach(key => {
			if (prevProps[key] !== context.props[key]) {
				console.log(`prop ${key} changed from ${prevProps[key]} to ${context.props[key]}`);
			}
		});
		console.groupEnd();
		fn.call(context, ...arguments);
	};
}
