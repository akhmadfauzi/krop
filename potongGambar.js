class Potong {
    constructor(obj) {
        this.wrapper = document.getElementById('kropBar');
        this.canvas = obj.canvas;
		this.data = document.getElementById('data');
		this.krop = 'krop';
		this.output = 'output';
        this.windowWidth = window.screen.width;
        this.windowHeight = window.screen.height;
        this.selectorId = (!obj.id) ? obj.id : 'Selector';
        this.reverse = false;
        this.isMoving = false;
        this.bodyMargin = parseInt(window.getComputedStyle(document.body).getPropertyValue('margin'));
        this.maxLeft = 0;
        this.minLeft = 0;
        this.maxTop = 0;
		this.minTop = 0;
        this.mainImage;

        this.selector;
        this.isResizing;
        this.initialSelectorX;
        this.initialSelectorY;
    }

    run() {
        
        this.renderCanvas();
        this.renderCropButton();
        this.canvas = document.getElementById(this.canvas);
        this.krop = document.getElementById(this.krop);
        this.mainImage = document.images[0];
        this.canvas.addEventListener('click', this.canvasHandler.bind(this));
        this.canvas.addEventListener('mousedown', this.canvasHandler.bind(this));
        this.canvas.addEventListener('mouseup', this.canvasHandler.bind(this));
		this.krop.addEventListener('click', this.kropHandler.bind(this));
		//document.addEventListener('click', this.hideModal.bind(this));
	}

	hideModal(e){
		var target = e.target;
		var isActive = this.output.getAttribute('data-active') ? true : false;
		var isOutside = false;
		
		var role = target.getAttribute('role');
		if(role != 'dialog' || role != 'document'){

		}

		var text = 'Is outside the modal = ' + isOutside + '<br>' + 
		'Target Element = ' + target.nodeName + '<br>' +
		'Target Attribute = ' + target.getAttribute('id') + '<br>' +
		'isActive = ' + isActive + '<br>' +
		'Target Role = ' + target.getAttribute('role');

		this.data.innerHTML = text;

		
    }
    
    toggleModal(overlay){
        var target = overlay.target;
        overlay.style.display = 'block';
        document.body.className = 'modal-open';
        this.output.className = 'output-show';
    }
	
	kropHandler(e){
        if(!this.selector) {
            alert('No area selected');
            return false;
        };

        this.renderOutput();
        this.output = document.getElementById(this.output);
        
        var overlay = document.querySelector('.modal-overlay');
        this.toggleModal(overlay);
		var selector = JSON.parse(this.selector.getAttribute('data-selector-details'));
		var canvas = document.createElement('canvas');
		var width = document.createAttribute('width');
		var role = document.createAttribute('role');
		var id = document.createAttribute('id');
		var height = document.createAttribute('height');
		
		role.value = 'document';
		width.value = Math.round((selector.width)*1.4);
		id.value = 'CanvasOutput';
		height.value = Math.round((selector.height)*1.4);
		
		canvas.setAttributeNode(role);
		canvas.setAttributeNode(width);
		canvas.setAttributeNode(id);
		canvas.setAttributeNode(height);
		
		this.output.appendChild(canvas);				
        this.draw(selector);
        this.output.style.left = ((overlay.clientWidth - this.output.clientWidth) / 2) + 'px';
        this.output.style.top = ((overlay.clientHeight - this.output.clientHeight) / 2) + 'px';
        overlay.addEventListener('click', ()=>{alert('a')});
        // console.log(this.output.clientWidth, document.body.clientWidth);
	}

	draw(selector){
		var canvas = document.getElementById('CanvasOutput');
		var ctx = canvas.getContext('2d');
		var sx = Math.round((selector.x-105)*1.4);//(selector.x);
		var sy = Math.round((selector.y)*1.4);
		var sWidth = Math.round((selector.width)*1.4);
		var sHeight = Math.round((selector.height)*1.4) ;
		// console.log(sx, sy,selector.x, selector.y, Math.round((selector.x-105)*1.4) + ' 1.4 times X');
		var dx = 0;
		var dy = 0;
		var dWidth = sWidth;
		var dHeight = sHeight;
		ctx.drawImage(this.mainImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

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
			this.selector.dataset.selectorDetails = JSON.stringify({x: this.initialSelectorX, y:this.initialSelectorY});
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
			this.selector.dataset.selectorDetails = JSON.stringify({x: this.initialSelectorX, y:this.initialSelectorY, width: width, height: height});
            // this.displayCoordinates(e, width, height, left, right);
        }
	}
	
	setClip(x,y){
		let clipTop = y;
		let clipRight = this.canvas.clientWidth-x - this.selector.clientWidth-105;
		let clipBottom = (this.canvas.clientHeight-this.selector.clientHeight-y);
        let clipLeft =x-105;
        
		this.mainImage.style.clipPath = 'inset('+clipTop+'px '+clipRight+'px '+clipBottom+'px '+clipLeft+'px)';
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
			currentTop = (currentTop < this.minTop ? this.minTop : (currentTop > this.maxTop ? this.maxTop - 1 : currentTop));
			currentLeft = (currentLeft > this.maxLeft ? this.maxLeft - 1 : (currentLeft < this.minLeft ? this.minLeft : currentLeft));
			
			this.selector.style.top = currentTop + 'px';
			this.selector.style.left = currentLeft + 'px';
			this.selector.dataset.selectorDetails = JSON.stringify({x: currentLeft, y:currentTop, width: this.selector.clientWidth, height: this.selector.clientHeight});

			this.setClip(currentLeft, currentTop);
			
        }
    }

    renderCanvas(){
        var container = document.createElement('DIV');
        var image = document.createElement('IMG');

        var cid = document.createAttribute('id');
        var cClass = document.createAttribute('class');
        var imgClass = document.createAttribute('class');
        var imgSource = document.createAttribute('src');
        var imgBg = document.createElement('IMG');
        imgBg.setAttribute('src','img/image-1.jpeg');
        imgBg.setAttribute('class','image-background');

        imgSource.value = 'img/image-1.jpeg';
        imgClass.value = 'img-krop';
        cClass.value = 'canvas';

        cid.value = 'Canvas';
        container.setAttributeNode(cid);
        container.setAttributeNode(cClass);
        image.setAttributeNode(imgClass);
        image.setAttributeNode(imgSource);
        container.appendChild(image);
        container.appendChild(imgBg);
        this.wrapper.appendChild(container);
    }

    renderCropButton(){
        var container = document.createElement('DIV');
        var button = document.createElement('button');
        button.setAttribute('id','krop');
        button.textContent = 'Krop';
        container.appendChild(button);
        this.wrapper.appendChild(container);
    }

    renderOutput(){
        var container = document.createElement('DIV');
        container.setAttribute('id', 'output');
        var overlay = document.createElement('DIV');
        overlay.setAttribute('class', 'modal-overlay')
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
			'Reverse Mode : ' + this.reverse;
	}
}

var gunting = new Potong({
    'canvas': 'Canvas',
    'id': 'Selector'
}).run();
