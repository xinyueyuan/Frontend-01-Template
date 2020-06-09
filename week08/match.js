function match(selector, element) {
	let current = element;
	let elementArray = [current]
	while(current.parentElement) {
		if(current.parentElement.tagName === 'HTML') {
			break;
		}
		elementArray.push(current.parentElement)
		current = current.parentElement
	}
	let selectorList = {}
	var selector = selector;
	var idSelector = selector.match(/#[a-z]+[a-z0-9]*/g);
	var classSelector = selector.match(/\.[a-z]+[a-z0-9]*/g);
	var typeSelector = selector.match(/^[a-z]*/g);

	selectorList.type = typeSelector && typeSelector[0]
	selectorList.id = idSelector && idSelector[0]
	selectorList.classSelector = classSelector
	// console.log(selectorList, elementArray[0])


	if(selectorList.type) {
		if(elementArray[0].tagName.toLowerCase() !== selectorList.type.toLowerCase()) {
			return false
		}
	}
	if(selectorList.id) {
		if(elementArray[0].id !== selectorList.id.slice(1)) {
			return false
		}
	}
	if(selectorList.classSelector && selectorList.classSelector.length) {
		for(let classItem of selectorList.classSelector) {
			let className = elementArray[0].className.split(' ')
			console.log(classItem, className)
			if(!className.includes(classItem.slice(1))) {
				return false;
			}
		}
	}
	return true
}
