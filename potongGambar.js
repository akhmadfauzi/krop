class Potong {
    constructor(obj) {
        this.canvas = document.getElementById(obj.canvas);
        this.data = document.getElementById('data');
        this.windowWidth = window.screen.width;
        this.windowHeight = window.screen.height;
        this.selectorId = (!obj.id) ? obj.id : 'Selector';
        this.selector;
        this.isResizing;
        this.initialSelectorX;
        this.initialSelectorY;
        this.reverse = false;
        this.isMoving = false;
        this.bodyMargin = parseInt(window.getComputedStyle(document.body).getPropertyValue('margin'));
        this.maxLeft = 0;
        this.minLeft = 0;
        this.maxTop = 0;
		this.minTop = 0;
		this.mainImage = document.images[0];
    }

    run(selector = 'canvas') {
        this[selector].addEventListener('click', this.canvasHandler.bind(this));
        this[selector].addEventListener('mousedown', this.canvasHandler.bind(this));
        this[selector].addEventListener('mouseup', this.canvasHandler.bind(this));
        document.addEventListener('mousemove', (e) => {
            var outputMouse = document.getElementById('MouseEvent');
            outputMouse.innerHTML =
                'CLient X : ' + e.clientX + '<br>' +
                'CLient Y : ' + e.clientY + '<br>' +
                'Screen X : ' + e.screenX + '<br>' +
                'Screen Y : ' + e.screenY + '<br>' +
                'Page X : ' + e.pageX + '<br>' +
                'Page Y : ' + e.pageY + '<br>' +
                'Offset X : ' + e.offsetX + '<br>' +
                'Offset Y : ' + e.offsetY + '<br>' +
                'Outer Width : ' + window.outerWidth + '<br>' +
                'Outer Height : ' + window.outerHeight + '<br>';

        });
    }

    canvasHandler(e) {
        switch (e.type) {
            case 'click':
                this.onClick(e);
                break;
            case 'mousedown':
                this.onMouseDown(e);
                break;
            case 'mouseup':
                this.onMouseUp(e);
                break;
            default:
                break;
        }
    }

    createSelector(e) {
        let selector = document.createElement('div');
        let id = document.createAttribute('id');
        id.value = this.selectorId;
        selector.setAttributeNode(id);
        selector.className = 'selector-default';
        this.createSelectorPoints().forEach(element => selector.appendChild(element));
        this.canvas.appendChild(selector);
    }

    createSelectorPoints() {
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

    onMouseDown(e) {
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
            this.selector.style.top = (e.clientY - this.bodyMargin) + 'px';
            this.selector.style.left = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin) + 'px';
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
                if (this.reverse == false) {
                    this.reverse = true;
                    this.selector.style.removeProperty('left');
                    this.selector.style.right = this.canvas.clientWidth - this.initialSelectorX + 'px';
                }
                width = parseInt(width.toString().replace('-', ''));


            } else {
                if (this.reverse == true) {
                    this.reverse = false;
                    this.selector.style.removeProperty('right');
                    this.selector.style.left = (this.initialSelectorX) + 'px';
                }
            }

            this.selector.style.height = (height >= 500 ? 500 : height) + 'px';
			this.selector.style.width = (width >= this.canvas.clientWidth ? this.canvas.clientWidth : width) + 'px';
			this.setClip(this.initialSelectorX, this.initialSelectorY);

            this.displayCoordinates(e, width, height, left, right);
        }
	}
	
	setClip(x,y){
		let clipTop = y;
		let clipRight = this.canvas.clientWidth-x - this.selector.clientWidth-105;
		let clipBottom = (this.canvas.clientHeight-this.selector.clientHeight-y);
		let clipLeft =x-105;
		this.mainImage.style.clipPath = 'inset('+clipTop+'px '+clipRight+'px '+clipBottom+'px '+clipLeft+'px)';
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
			'Reverse Mode : ' + this.reverse;
	}

    onClick(e) {
        this.initialSelectorX = e.clientX;
        this.initialSelectorY = e.clientY;
    }

    onMouseUp(e) {
        this.isResizing = false;
        this.isMoving = false;
    }

    onSelectorMouseDown(e) {
        if (this.isResizing) {
            console.log('selector down');
        }
    }

    onSelectorMouseMove(e) {
        if (this.isMoving) {
            var currentLeft = (e.clientX - ((document.body.clientWidth - this.canvas.clientWidth) / 2) - this.bodyMargin) - (this.selector.clientWidth / 2);
            var currentTop = e.clientY - (this.selector.clientHeight / 2);

			this.maxLeft = this.canvas.clientWidth - this.selector.clientWidth;
            this.maxTop = this.canvas.clientHeight - this.selector.clientHeight;
			
            this.selector.style.top = (currentTop < this.minTop ? this.minTop : (currentTop > this.maxTop ? this.maxTop - 1 : currentTop)) + 'px';
			this.selector.style.left = (currentLeft > this.maxLeft ? this.maxLeft - 1 : (currentLeft < this.minLeft ? this.minLeft : currentLeft)) + 'px';
			this.setClip(currentLeft, currentTop);
			
        }
    }
}

var gunting = new Potong({
    'canvas': 'Canvas',
    'id': 'Selector'
}).run();
