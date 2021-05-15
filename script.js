let container = document.querySelector('.data_container');
let alignments = document.querySelectorAll('.alignment'); //left, right, center
let fontStyleOptions = document.querySelectorAll('#font_style'); //bold ,italic , underline
let arr = [];
let row = 25;
let column = 25;
let sheets = {
	'1': {}
};
let selectedSheet = '1';
let DefaultProperties = {
	fontFamily: 'Noto Sans',
	fontSize: 1.2,
	text: '',
	bold: false,
	italic: false,
	underline: false,
	alignment: 'left',
	backgroundColor: '',
	color: ''
};

function updateSheetData(property, value) {
	if (value !== DefaultProperties[property]) {
		let selectedCells = document.querySelectorAll('.selected');
		for (let selectedCell of selectedCells) {
			let row = Number.parseInt(selectedCell.getAttribute('row'));
			let col = Number.parseInt(selectedCell.getAttribute('col'));
			let key = row + '-' + col;
			if (sheets[selectedSheet][key] == undefined) {
				sheets[selectedSheet][key] = {};
				sheets[selectedSheet][key] = {
					...DefaultProperties,
					[property]: value
				};
			} else {
				sheets[selectedSheet][key] = {
					...sheets[selectedSheet][key],
					[property]: value
				};
			}
		}
	} else {
		let selectedCells = document.querySelectorAll('.selected');
		for (let selectedCell of selectedCells) {
			let row = Number.parseInt(selectedCell.getAttribute('row'));
			let col = Number.parseInt(selectedCell.getAttribute('col'));
			let key = row + '-' + col;
			if (sheets[selectedSheet][key] != undefined) {
				sheets[selectedSheet][key][property] = value;
				if (JSON.stringify(sheets[selectedSheet][key]) == JSON.stringify(DefaultProperties)) {
					delete sheets[selectedSheet][key];
				}
			}
		}
	}
}

function getcols(cnt, arr, c, j) {
	if (cnt > column) return;
	for (let i = 0; i < 26; i++) {
		if (cnt < column) {
			arr.push(c + String.fromCharCode(65 + i));
			cnt++;
		} else {
			return;
		}
	}
	getcols(cnt, arr, String.fromCharCode(65 + j), j + 1);
}

function addAttribute(el, i, j) {
	el.setAttribute('row', i);
	el.setAttribute('col', j);
	if (el.nodeName === 'INPUT') {
		el.setAttribute('type', 'text');
		el.setAttribute('readonly', true);
	}
}

function addCells(i, j, data) {
	let el;
	let input = document.createElement('input');
	let div = document.createElement('div');

	if (i == 0 && j == 0) {
		el = div;
		el.classList.add('selectAll', 'cell');
	} else if (j == 0 && i != 0) {
		el = div;
		el.innerText = i;
		el.classList.add('row', 'cell');
	} else if (i == 0 && j != 0) {
		el = div;
		el.innerText = data;
		el.classList.add('column', 'cell');
	} else {
		el = input;
		el.classList.add('cell', 'editable_cell');
	}
	addAttribute(el, i, j);
	container.appendChild(el);
}

//generating column names
getcols(0, arr, '', 0);

//generating 2d grid
for (let i = 0; i < row + 1; i++) {
	for (let j = 0; j < column + 1; j++) {
		addCells(i, j, arr[j - 1]);
	}
}

function getTopLeftBottomRightCell(rowId, colId) {
	let topCell = document.querySelector(`.cell[row = '${rowId - 1}'][col = '${colId}']`);
	let bottomCell = document.querySelector(`.cell[row = '${rowId + 1}'][col = '${colId}']`);
	let leftCell = document.querySelector(`.cell[row = '${rowId}'][col = '${colId - 1}']`);
	let rightCell = document.querySelector(`.cell[row = '${rowId}'][col = '${colId + 1}']`);
	return [ topCell, bottomCell, leftCell, rightCell ];
}

//seleting the cell when ctrl key is pressed
function selectCell(el, top, right, bottom, left) {
	let topSelected;
	if (top) {
		topSelected = [ ...top.classList ].includes('selected');
	}

	let rightSelected;
	if (right) {
		rightSelected = [ ...right.classList ].includes('selected');
	}

	let bottomSelected;
	if (bottom) {
		bottomSelected = [ ...bottom.classList ].includes('selected');
	}

	let leftSelected;
	if (left) {
		leftSelected = [ ...left.classList ].includes('selected');
	}

	if (topSelected) {
		el.classList.add('top_selected');
		top.classList.add('bottom_selected');
	}

	if (rightSelected) {
		el.classList.add('right_selected');
		right.classList.add('left_selected');
	}

	if (bottomSelected) {
		el.classList.add('bottom_selected');
		bottom.classList.add('top_selected');
	}

	if (leftSelected) {
		el.classList.add('left_selected');
		left.classList.add('right_selected');
	}
	el.classList.add('selected');
}

//unseleting the cell when ctrl key is pressed
function unselectCell(el, top, right, bottom, left) {
	let classArr = [ ...el.classList ];
	if (classArr.includes('top_selected')) {
		el.classList.remove('top_selected');
		top.classList.remove('bottom_selected');
	}
	if (classArr.includes('right_selected')) {
		el.classList.remove('right_selected');
		right.classList.remove('left_selected');
	}
	if (classArr.includes('bottom_selected')) {
		el.classList.remove('bottom_selected');
		bottom.classList.remove('top_selected');
	}
	if (classArr.includes('left_selected')) {
		el.classList.remove('left_selected');
		left.classList.remove('right_selected');
	}

	el.classList.remove('selected');
}

//selecting cell with mouse
function mouseSelection(startCell, endCell) {
	let selectedCells = document.querySelectorAll('.selected');
	for (let selectedCell of selectedCells) {
		selectedCell.classList.remove('selected', 'top_selected', 'right_selected', 'bottom_selected', 'left_selected');
	}

	let rs = Math.min(startCell.row, endCell.row);
	let re = Math.max(startCell.row, endCell.row);
	let cs = Math.min(startCell.col, endCell.col);
	let ce = Math.max(startCell.col, endCell.col);

	for (let i = rs; i <= re; i++) {
		for (let j = cs; j <= ce; j++) {
			let [ topCell, bottomCell, leftCell, rightCell ] = getTopLeftBottomRightCell(i, j);
			let el = document.querySelector(`.cell[row = '${i}'][col = '${j}']`);
			selectCell(el, topCell, rightCell, bottomCell, leftCell);
		}
	}
}

function addRemoveStyle(obj, prop) {
	let el = document.querySelector(`div[data = '${prop}']`);
	if (obj[prop]) {
		el.classList.add('icon_selected');
	} else {
		el.classList.remove('icon_selected');
	}
}

function addRemoveColor(obj, prop) {
	let el = document.querySelector(`svg[name = '${prop}']`);
	if (obj[prop] !== '') {
		el.style.fill = obj[prop];
	} else {
		el.style.fill = '#000';
	}
}

//font family and font size
function addRemoveFontProperties(obj, prop) {
	let el = document.querySelector(`select[id = '${prop}']`);
	if (el === 'fontFamily') {
		if (obj[prop] !== '') {
			el.value = obj[prop];
		} else {
			el.value = 'Noto Sans';
		}
	} else {
		if (obj[prop] !== '') {
			el.value = obj[prop];
		} else {
			el.value = '1.2';
		}
	}
}

// changing the header when cell is clicked
function changeHeader(row, col) {
	let obj;
	let key = row + '-' + col;
	if (sheets[selectedSheet][key]) {
		obj = sheets[selectedSheet][key];
	} else {
		obj = { ...DefaultProperties };
	}
	let prev_selected = document.querySelector('.alignment.icon_selected');
	if (prev_selected != null) prev_selected.classList.remove('icon_selected');
	let cur = document.querySelector(`.alignment[data = '${obj.alignment}']`);
	cur.classList.add('icon_selected');

	addRemoveStyle(obj, 'bold');
	addRemoveStyle(obj, 'italic');
	addRemoveStyle(obj, 'underline');

	//for colors
	addRemoveColor(obj, 'backgroundColor');
	addRemoveColor(obj, 'color');

	//fontproperties
	addRemoveFontProperties(obj, 'fontFamily');
	addRemoveFontProperties(obj, 'fontSize');
}

//keydown event detects all keys
//keypress doesnt detect alt,ctrl, enter,shift

let startCell = {};
let endCell = {};

let cells = document.querySelectorAll('.editable_cell');
for (let cell of cells) {
	//event for seleted cell
	cell.addEventListener('click', (e) => {
		let row = Number.parseInt(cell.getAttribute('row'));
		let col = Number.parseInt(cell.getAttribute('col'));
		let [ topCell, bottomCell, leftCell, rightCell ] = getTopLeftBottomRightCell(row, col);

		if (e.ctrlKey && [ ...cell.classList ].includes('selected')) {
			unselectCell(cell, topCell, rightCell, bottomCell, leftCell);
		} else if (e.ctrlKey && ![ ...cell.classList ].includes('selected')) {
			selectCell(cell, topCell, rightCell, bottomCell, leftCell);
		} else {
			let selectedCells = document.querySelectorAll('.selected');
			for (let selectedCell of selectedCells) {
				selectedCell.classList.remove(
					'selected',
					'top_selected',
					'right_selected',
					'bottom_selected',
					'left_selected'
				);
				selectedCell.setAttribute('readonly', true);
			}
			cell.classList.add('selected');
			changeHeader(row, col);
		}
	});

	//event for focusing the input
	cell.addEventListener('dblclick', () => {
		let selectedCells = document.querySelectorAll('.selected');
		for (let selectedCell of selectedCells) {
			selectedCell.classList.remove('selected');
			selectedCell.setAttribute('readonly', true);
		}
		cell.removeAttribute('readonly');
		cell.classList.add('selected');
	});

	//events for the mouse Selection
	cell.addEventListener('mousedown', (e) => {
		// 1 == left click , 2 == right click // 0 no click
		if (e.buttons == 1) {
			startCell.row = e.target.getAttribute('row');
			startCell.col = e.target.getAttribute('col');
		}
	});

	//mouse enter event triggers when entering a new node
	// window.innerWidth gives viewport width
	// e.pageX gives x coordinate of cursor wrt viewport
	cell.addEventListener('mouseenter', (e) => {
		if (e.buttons == 1) {
			// scroll right
			if (Math.abs(e.pageX - window.innerWidth) <= 150) {
				container.scrollBy({
					top: 0,
					left: 100,
					behavior: 'smooth'
				});
			}

			//scroll left
			if (e.pageX <= 150) {
				container.scrollBy({
					top: 0,
					left: -100,
					behavior: 'smooth'
				});
			}
			endCell.row = e.target.getAttribute('row');
			endCell.col = e.target.getAttribute('col');
			mouseSelection(startCell, endCell);
		}
	});

	cell.addEventListener('change', (e) => {
		updateSheetData('text', e.target.value);
	});
}

// for changing the data alignment of cell
for (let alignment of alignments) {
	alignment.addEventListener('click', (e) => {
		let a = alignment.getAttribute('data');
		let prev_selected = document.querySelector('.alignment.icon_selected');

		prev_selected.classList.remove('icon_selected');
		alignment.classList.add('icon_selected');
		let selectedCells = document.querySelectorAll('.selected');

		for (let selectedCell of selectedCells) {
			selectedCell.style.textAlign = a;
			updateSheetData('alignment', a);
		}
	});
}

function setStyle(el, classname) {
	let arr = [ ...el.classList ];
	if (arr.includes('icon_selected')) {
		el.classList.remove('icon_selected');
		let selectedCells = document.querySelectorAll('.selected');

		for (let selectedCell of selectedCells) {
			selectedCell.classList.remove(classname);
			updateSheetData(classname, false);
		}
	} else {
		el.classList.add('icon_selected');
		let selectedCells = document.querySelectorAll('.selected');

		for (let selectedCell of selectedCells) {
			selectedCell.classList.add(classname);
			updateSheetData(classname, true);
		}
	}
}

//for bold italic underline
for (let option of fontStyleOptions) {
	option.addEventListener('click', (e) => {
		let style = option.getAttribute('data'); //bold or italic or underline
		setStyle(option, style);
	});
}

//color pickers
const pickr1 = Pickr.create({
	el: '.bg_color_picker',
	theme: 'monolith', // or 'monolith', or 'nano'

	swatches: [
		'rgba(244, 67, 54, 1)',
		'rgba(233, 30, 99, 0.95)',
		'rgba(156, 39, 176, 0.9)',
		'rgba(103, 58, 183, 0.85)',
		'rgba(63, 81, 181, 0.8)',
		'rgba(33, 150, 243, 0.75)',
		'rgba(3, 169, 244, 0.7)',
		'rgba(0, 188, 212, 0.7)',
		'rgba(0, 150, 136, 0.75)',
		'rgba(76, 175, 80, 0.8)',
		'rgba(139, 195, 74, 0.85)',
		'rgba(205, 220, 57, 0.9)',
		'rgba(255, 235, 59, 0.95)',
		'rgba(255, 193, 7, 1)'
	],

	components: {
		// Main components
		preview: true,
		opacity: true,
		hue: true
	}
});

const pickr2 = Pickr.create({
	el: '.text_color_picker',
	theme: 'monolith', // or 'monolith', or 'nano'

	swatches: [
		'rgba(244, 67, 54, 1)',
		'rgba(233, 30, 99, 0.95)',
		'rgba(156, 39, 176, 0.9)',
		'rgba(103, 58, 183, 0.85)',
		'rgba(63, 81, 181, 0.8)',
		'rgba(33, 150, 243, 0.75)',
		'rgba(3, 169, 244, 0.7)',
		'rgba(76, 175, 80, 0.8)',
		'rgba(139, 195, 74, 0.85)',
		'rgba(205, 220, 57, 0.9)',
		'rgba(255, 235, 59, 0.95)',
		'rgba(255, 193, 7, 1)'
	],

	components: {
		// Main components
		preview: true,
		opacity: true,
		hue: true
	}
});

function changeCellColor(property, color) {
	let selectedCells = document.querySelectorAll('.selected');
	let el = document.querySelector(`svg[name = '${property}']`);
	el.style.fill = color;
	for (let selectedCell of selectedCells) {
		selectedCell.style[property] = color;
		updateSheetData(property, color);
	}
}
const pickers = [ { name: 'backgroundColor', el: pickr1 }, { name: 'color', el: pickr2 } ];
for (let picker of pickers) {
	picker.el.on('change', (color, instance) => {
		changeCellColor(picker.name, color.toHEXA().toString());
	});

	picker.el.on('changestop', () => {
		picker.el.hide();
	});
	picker.el.on('swatchselect', (color, instance) => {
		changeCellColor(picker.name, color.toHEXA().toString());
		picker.el.hide();
	});
}

function addMenuStyles(prop, val) {
	let selectedCells = document.querySelectorAll('.selected');
	for (let selectedCell of selectedCells) {
		updateSheetData(prop, val);
		selectedCell.style[prop] = prop === 'fontSize' ? val + 'rem' : val;
	}
}

//font styles
let menus = document.querySelectorAll('select');
for (let menu of menus) {
	menu.addEventListener('change', (e) => {
		let el = menu.getAttribute('id');
		let v = e.target.value;
		if (el === 'fontSize') {
			v = Number.parseFloat(v);
		}
		addMenuStyles(el, v);
	});
}

// all the logic related related to sheet change new sheet

function emptySheet() {
	let cells = sheets[selectedSheet];
	for (let key in cells) {
		let row = key.split('-')[0];
		let col = key.split('-')[1];
		let cell = document.querySelector(`input[row = '${row}'][col = '${col}']`);
		cell.value = '';
		cell.style.backgroundColor = '#fff';
		cell.style.color = '#000';
		cell.style.fontSize = '1.2rem';
		cell.classList.remove('bold', 'underline', 'italic');
		changeHeader(row, col);
	}
}

function addDataToCell(obj, el) {
	el.value = obj.text;
	el.style.backgroundColor = obj.backgroundColor;
	el.style.color = obj.color;
	el.style.fontSize = obj.fontSize;
	if (obj.bold == true) {
		e.classList.add('bold');
	}

	if (obj.italic == true) {
		e.classList.add('bold');
	}

	if (obj.underline == true) {
		e.classList.add('bold');
	}
}

function loadCurrentSheetData(no) {
	let cells = sheets[no];
	for (let key in cells) {
		let obj = cells[key];
		let row = key.split('-')[0];
		let col = key.split('-')[1];
		let cell = document.querySelector(`input[row = '${row}'][col = '${col}']`);
		addDataToCell(obj, cell);
	}
}

function resetSelectedCells() {
	let selectedCells = document.querySelectorAll('.selected');
	for (let selectedCell of selectedCells) {
		selectedCell.classList.remove('selected', 'top_selected', 'right_selected', 'bottom_selected', 'left_selected');
		selectedCell.setAttribute('readonly', true);
	}
}

function resetHeader() {
	let icons = document.querySelectorAll('.menu_icon');
	let svgs = document.querySelectorAll('.menu_icon svg');

	for (let icon of icons) {
		icon.classList.remove('icon_selected');
	}

	for (let svg of svgs) {
		svg.style.fill = '#000';
	}
}

function sheetClickHandler(sheet) {
	let no = sheet.getAttribute('no');

	emptySheet(selectedSheet);
	selectedSheet = no;
	loadCurrentSheetData(no);

	let bSheets = document.querySelectorAll('.sheetno'); //bsheets alias for bottom sheets
	for (let s of bSheets) {
		s.classList.remove('sheet_selected');
	}
	resetSelectedCells();
	resetHeader();
	sheet.classList.add('sheet_selected');
}

function addListenersToSheet(sheet) {
	sheet.addEventListener('contextmenu', (e) => {
		e.preventDefault();
	});

	sheet.addEventListener('click', (e) => {
		sheetClickHandler(sheet);
	});

	//renaming the sheet
	sheet.addEventListener('dblclick', (e) => {
		sheet.setAttribute('contenteditable', true);
	});

	sheet.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			sheet.setAttribute('contenteditable', false);
		}
	});
}

function createNewSheet() {
	//resetting the sheets
	emptySheet();

	let newSheetNo = Number.parseInt(Object.keys(sheets).length) + 1 + '';
	sheets[newSheetNo] = {};
	selectedSheet = newSheetNo;

	let bottomSheets = document.querySelectorAll('.sheetno');
	let sheetsContainer = document.querySelector('.sheets');
	for (let sheet of bottomSheets) {
		sheet.classList.remove('sheet_selected');
	}
	let newSheet = document.createElement('div');
	newSheet.innerText = 'Sheet ' + newSheetNo;
	newSheet.setAttribute('no', newSheetNo);
	newSheet.classList.add('sheetno', 'sheet_selected');
	addListenersToSheet(newSheet);
	sheetsContainer.appendChild(newSheet);

	loadCurrentSheetData(newSheetNo);
	resetSelectedCells();
	resetHeader();
}

//creating a new sheet
let plus_btn = document.querySelector('.icon.icon-circle');
plus_btn.addEventListener('click', (e) => {
	createNewSheet();
});

//sheet operations
let bottomSheets = document.querySelectorAll('.sheetno');
for (let sheet of bottomSheets) {
	addListenersToSheet(sheet);
}

//  logic related to sheets ends
