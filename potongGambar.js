'use strict';

class Potong {
	constructor(obj) {
		this.wrapper = document.getElementById('kropBar');
		this.canvas = obj.canvas;
		this.data = document.getElementById('data');
		this.krop = 'krop';
		this.output;
		this.windowWidth = window.screen.width;
		this.windowHeight = window.screen.height;
		this.selectorId = (!obj.id) ? obj.id : 'Selector';
		this.reverseX = false;
		this.reverseY = false;
		this.isMoving = false;
		this.bodyMargin = parseInt(window.getComputedStyle(document.body).getPropertyValue('margin'));
		this.maxLeft = 0;
		this.minLeft = 0;
		this.maxTop = 0;
		this.minTop = 0;
		this.mainImage;
		this.maxHeight = 500;
		this.maxWidth = 960;
		this.selector;
		this.isResizing;
		this.initialSelectorX;
		this.initialSelectorY;
		this.imageSource;
		this.mouseEvent;
	}

	run() {

		this.renderCanvas();
		this.renderButton();
		this.setImage();

		this.imageSource = document.getElementById('imageSource');
		this.canvas = document.getElementById(this.canvas);
		this.krop = document.getElementById(this.krop);
		this.mainImage = document.images[1];
		this.imageSource.addEventListener('change', this.onImageSourceChange.bind(this));

		this.canvas.addEventListener('click', this.canvasHandler.bind(this));
		this.canvas.addEventListener('mousedown', this.canvasHandler.bind(this));
		this.canvas.addEventListener('mouseup', this.canvasHandler.bind(this));
		this.krop.addEventListener('click', this.kropHandler.bind(this));
	}

	onImageSourceChange(e) {
		var target = e.target;
		var bg = document.getElementById('imageBackground');
		var hidden = document.getElementById('isChanged');
		var canvasImage = document.querySelector('.img-krop');
		var img = '';

		var fReader = new FileReader();
		fReader.readAsDataURL(target.files[0]);
		fReader.onload = function (event) {
			img = event.target.result;
			canvasImage.src = img;
			bg.src = img;
			hidden.value = true;
		};

		canvasImage.addEventListener('load', (e) => {
			var target = e.path[0];
			var currentOffsetX = (this.canvas.clientWidth - target.clientWidth) / 2;
			canvasImage.style.left = currentOffsetX + 'px';
			canvasImage.dataset.offsetX = currentOffsetX;
			bg.style.left = currentOffsetX + 'px';
		});
	}

	toggleModal(overlay) {
		overlay.style.display = 'block';
		document.body.className = 'modal-open';
		this.output.className = 'output-show';
	}

	closeModal(e) {
		var target = e.target;
		if (target.className == 'modal-overlay') {
			var canvas = document.getElementById('CanvasOutput');
			var output = document.getElementById('output');
			output.remove();
			canvas.remove();
			target.remove();
			document.body.removeAttribute('class');


		}
	}

	kropHandler() {
		if (!this.selector) {
			alert('No area selected');
			return false;
		}

		this.renderOutput();
		this.imgWidthRatio = this.mainImage.naturalWidth / this.mainImage.clientWidth;

		this.output = document.getElementById('output');
		var overlay = document.querySelector('.modal-overlay');

		var selector = JSON.parse(this.selector.getAttribute('data-selector-details'));
		var canvas = document.createElement('canvas');
		var width = document.createAttribute('width');
		var role = document.createAttribute('role');
		var id = document.createAttribute('id');
		var height = document.createAttribute('height');

		role.value = 'document';
		width.value = Math.round((selector.width) * this.imgWidthRatio);
		id.value = 'CanvasOutput';
		height.value = Math.round((selector.height) * this.imgWidthRatio);

		if (isNaN(width.value)) {
			alert('make sure selec area');
			return false;
		}

		canvas.setAttributeNode(role);
		canvas.setAttributeNode(width);
		canvas.setAttributeNode(id);
		canvas.setAttributeNode(height);

		this.output.appendChild(canvas);
		this.toggleModal(overlay);
		this.draw(selector);

		this.output.style.left = ((overlay.clientWidth - this.output.clientWidth) / 2) + 'px';
		this.output.style.top = ((overlay.clientHeight - this.output.clientHeight) / 2) + 'px';
		overlay.addEventListener('click', this.closeModal);
		// console.log(this.output.clientWidth, document.body.clientWidth);
	}

	/** 
	 * Draw onto canvas 
	*/
	draw(selector) {
		let left = (this.mouseEvent.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin);
		var canvas = document.getElementById('CanvasOutput');
		var context = canvas.getContext('2d');
		var sourceX = Math.round((this.reverseX ? (left - this.sourceOffsetX) : (selector.x - this.sourceOffsetX)) * this.imgWidthRatio);//(selector.x);
		var sourceY = Math.round((this.reverseY ? (this.mouseEvent.clientY - this.bodyMargin) : selector.y) * this.imgWidthRatio);
		var sourceWidth = Math.round((selector.width) * this.imgWidthRatio);
		var sourceHeight = Math.round((selector.height) * this.imgWidthRatio);
		var destinationX = 0;
		var destinationY = 0;
		var destinationWidth = sourceWidth;
		var destinationHeight = sourceHeight;
		context.drawImage(this.mainImage, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
	}

	/**
	 * 
	 * @param {*} e mouse event
	 */
	canvasHandler(e) {
		// Initialize offsetX of displayed image to the canvas wrapper
		this.sourceOffsetX = (this.canvas.clientWidth - this.mainImage.clientWidth) / 2;
		switch (e.type) {
		case 'click':
			this.onClick(e);
			break;
		case 'mousedown':
			this.onMouseDown(e);
			break;
		case 'mouseup':
			this.onMouseUp();
			break;
		default:
			break;
		}
	}

	/**
	 * 
	 * @function # apply generated selector points and render to the document
	 * @returns void
	 */
	createSelector() {
		let selector = document.createElement('div');
		let id = document.createAttribute('id');
		id.value = this.selectorId;
		selector.setAttributeNode(id);
		selector.className = 'selector-default';
		this.generateSelectorPoints().forEach(element => selector.appendChild(element));
		this.canvas.appendChild(selector);
	}

	/**
	 * @function # generate selector points for selector interface automatically
	 */
	generateSelectorPoints() {
		var pointsDom = [];
		let points = ['topLeft', 'topCenter', 'topRight', 'middleLeft', 'middleRight', 'bottomLeft', 'bottomCenter', 'bottomRight'];
		let pointIds = ['idTopLeft', 'idTopCenter', 'idTopRight', 'idMiddleLeft', 'idMiddleRight', 'idBottomLeft', 'idBottomCenter', 'idBottomRight'];

		pointIds.forEach(obj => {
			window[obj] = document.createAttribute('id');
			window[obj]['value'] = obj.substr(2);
		});

		points.forEach((obj, i) => {
			var pattern = /(left|center|right)/i;
			window[obj] = document.createElement('span');
			window[obj]['setAttributeNode'](window[pointIds[i]]);
			window[obj]['className'] = 'selector-point ' + obj.toLowerCase().replace(pattern, '-' + obj.toLowerCase().match(pattern)[0].toLowerCase());
			pointsDom.push(window[obj]);
			delete window[obj];
			delete window[pointIds[i]];
		});
		return pointsDom;

	}

	/**
	 * 
	 * @param {*} e 
	 * @event MouseDown 
	 */
	onMouseDown(e) {
		if (this.mainImage.getAttribute('style') != '') {
			this.mainImage.removeAttribute('style');
			this.mainImage.style.left = this.mainImage.dataset.offsetX + 'px';
		}

		if (e.target.id == 'Selector') {
			this.isMoving = true;
			this.canvas.addEventListener('mousemove', this.onSelectorMouseMove.bind(this));
		}
		else {
			this.initialSelectorX = (e.clientX) - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin;
			this.initialSelectorY = (e.clientY - this.bodyMargin);
			this.isResizing = true;

			if (!this.selector) {
				this.createSelector();

			} else {
				this.selector.remove();
				this.createSelector();
			}

			this.selector = document.getElementById(this.selectorId);
			this.selector.dataset.selectorDetails = JSON.stringify({ x: this.initialSelectorX, y: this.initialSelectorY });
			this.selector.style.top = this.initialSelectorY + 'px';
			this.selector.style.left = this.initialSelectorX + 'px';
			this.canvas.addEventListener('mousemove', this.onMove.bind(this));
		}
	}

	onMove(e) {
		if (this.isResizing) {
			let height = ((e.clientY - this.initialSelectorY) - this.bodyMargin);
			let width = ((e.clientX) - this.initialSelectorX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin);
			let left = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin);
			let right = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin);

			if (width < 0) {
				if (this.reverseX == false) {
					this.reverseX = true;
					this.selector.style.removeProperty('left');
					this.selector.style.right = this.canvas.clientWidth - this.initialSelectorX + 'px';
				}
				width = parseInt(width.toString().replace('-', ''));
			} else {
				if (this.reverseX == true) {
					this.reverseX = false;
					this.selector.style.removeProperty('right');
					this.selector.style.left = (this.initialSelectorX) + 'px';
				}
			}

			if (height < 0) {
				if (this.reverseY == false) {
					this.reverseY = true;
					this.selector.style.removeProperty('top');
					this.selector.style.bottom = this.canvas.clientHeight - this.initialSelectorY + 'px';
				}
				height = parseInt(height.toString().replace('-', ''));
			} else {
				if (this.reverseY == true) {
					this.reverseY = false;
					this.selector.style.removeProperty('bottom');
					this.selector.style.top = this.initialSelectorY + 'px';
				}
			}

			this.mouseEvent = e;
			this.selector.style.height = (height >= this.maxHeight ? this.maxHeight : height) + 'px';
			this.selector.style.width = (width >= this.canvas.clientWidth ? this.canvas.clientWidth : width) + 'px';
			this.setClip(this.initialSelectorX, this.initialSelectorY, e);
			this.selector.dataset.selectorDetails = JSON.stringify({ x: this.initialSelectorX, y: this.initialSelectorY, width: width, height: height });
			this.displayCoordinates(e, width, height, left, right);
		}
	}

	onMouseUp() {
		this.isResizing = false;
		this.isMoving = false;
	}

	setClip(x, y, e) {
		let left = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin);
		let clipTop = this.reverseY ? e.clientY - this.bodyMargin : y;
		let clipBottom = this.reverseY ? (this.canvas.clientHeight - y) : (this.canvas.clientHeight - this.selector.clientHeight - y);
		let clipRight = this.reverseX ? (this.canvas.clientWidth - x - this.sourceOffsetX) : (this.canvas.clientWidth - x - this.selector.clientWidth - this.sourceOffsetX);
		let clipLeft = this.reverseX ? (left - this.sourceOffsetX) : (x - this.sourceOffsetX);
		this.mainImage.style.clipPath = 'inset(' + clipTop + 'px ' + clipRight + 'px ' + clipBottom + 'px ' + clipLeft + 'px)';
	}

	onClick(e) {
		this.initialSelectorX = e.clientX;
		this.initialSelectorY = e.clientY;
	}

	onSelectorMouseMove(e) {
		if (this.isMoving) {
			var currentLeft = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin) - (this.selector.clientWidth / 2);
			var currentTop = e.clientY - (this.selector.clientHeight / 2);

			this.maxLeft = this.canvas.clientWidth - this.selector.clientWidth;
			this.maxTop = this.canvas.clientHeight - this.selector.clientHeight;
			currentTop = (currentTop < this.minTop ? this.minTop : (currentTop > this.maxTop ? this.maxTop - 1 : currentTop));
			currentLeft = (currentLeft > this.maxLeft ? this.maxLeft - 1 : (currentLeft < this.minLeft ? this.minLeft : currentLeft));

			this.selector.style.top = currentTop + 'px';
			this.selector.style.left = currentLeft + 'px';
			this.selector.dataset.selectorDetails = JSON.stringify({ x: currentLeft, y: currentTop, width: this.selector.clientWidth, height: this.selector.clientHeight });

			this.setClip(currentLeft, currentTop);

		}
	}

	renderCanvas() {
		var container = document.createElement('DIV');

		var cid = document.createAttribute('id');
		var cClass = document.createAttribute('class');

		var imgBg = document.createElement('IMG');
		imgBg.setAttribute('id', 'imageBackground');
		imgBg.setAttribute('src', 'img/image-1.jpeg');
		imgBg.setAttribute('class', 'image-background');

		cClass.value = 'canvas';
		cid.value = 'Canvas';
		container.setAttributeNode(cid);
		container.setAttributeNode(cClass);

		container.appendChild(imgBg);
		this.wrapper.appendChild(container);
	}

	setImage() {
		var container = document.getElementById('Canvas');
		var image = document.createElement('IMG');
		var imgClass = document.createAttribute('class');
		var imgSource = document.createAttribute('src');

		imgSource.value = 'img/image-1.jpeg';
		imgClass.value = 'img-krop';

		image.setAttributeNode(imgClass);
		image.setAttributeNode(imgSource);

		container.appendChild(image);
	}

	renderButton() {
		var container = document.createElement('DIV');
		var cropButton = document.createElement('button');
		var hidden = document.createElement('input');
		var file = document.createElement('input');
		cropButton.setAttribute('id', 'krop');
		file.setAttribute('id', 'imageSource');
		file.setAttribute('type', 'file');
		hidden.setAttribute('type', 'hidden');
		hidden.setAttribute('id', 'isChanged');
		hidden.setAttribute('value', false);

		cropButton.textContent = 'Krop';
		container.style.marginTop = '6px';
		container.appendChild(file);
		container.appendChild(cropButton);
		container.appendChild(hidden);

		this.wrapper.appendChild(container);
	}

	renderOutput() {
		var container = document.createElement('DIV');
		container.setAttribute('id', 'output');
		var overlay = document.createElement('DIV');
		overlay.setAttribute('class', 'modal-overlay');
		this.wrapper.appendChild(container);
		this.wrapper.appendChild(overlay);
	}

	displayCoordinates(e, width, height, left, right) {
		this.data.innerHTML =
			'Init X : ' + this.initialSelectorX + '<br>' +
			'Init Y : ' + this.initialSelectorY + '<br>' +
			'<hr>' +
			'Client X : ' + e.clientX + '<br>' +
			'Client Y : ' + e.clientY + '<br>' +
			'<hr>' +
			'Screen X : ' + e.screenX + '<br>' +
			'Screen Y : ' + e.screenY + '<br>' +
			'<hr>' +
			'Selector Width : ' + width + '<br>' +
			'Selector Height : ' + height + '<br>' +
			'<hr>' +
			'Left : ' + left + '<br>' +
			'Right : ' + right + '<br>' +
			'<hr>' +
			'Document width : ' + document.body.clientWidth + '<br>' +
			'Document height : ' + document.body.clientHeight + '<br>' +
			'<hr>' +
			'Reverse X : ' + this.reverseX + '<br>' +
			'Reverse Y : ' + this.reverseY;
	}
}

var settings = {
	'canvas': 'Canvas',
	'id': 'Selector'
};
var gunting = new Potong(settings);
gunting.run();
