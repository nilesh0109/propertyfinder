(function() {
    loadJson();
})();

function loadJson() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                var brokers = JSON.parse(xmlhttp.responseText).data;
                createCarousel(brokers);
            } else if (xmlhttp.status == 400) {
                console.log('There was an error 400');
            } else {
                console.log('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("GET", "Res/json/search.json", true);
    //xmlhttp.open("GET", "https://www.propertyfinder.ae/en/find-broker/ajax/search?page=1", true);

    xmlhttp.send();
}

function template(arr, html) {
    return arr.map(function(obj) {
        return html.join('').replace(
            /#\{([\w.]+)\}/g,
            function(_, match) {
                var obj1 = obj;
                return match.split('.').reduce(function(prev, curprop) {
                    return obj1 = obj1[curprop];
                }, '');
            }
        ).replace(/\$\((.+?)\)/g, function(_, match) {
            return eval(match);
        });
    }).join('');
}

function createCarousel(data_arr) {
    var html = template(data_arr, [
        '<li class="slider-item">',
        '<figure  class="img-container"><img src="#{links.logo}"/></figure>',
        '<div class="textWrapper">',
        '<a class="agent-name" href="javascript:void(0)">#{name}</a>',
        '<span class="location">#{location}</span>',
        '<span class="phone">#{phone}</span>',
        '</div>',
        '<div class="table-wrapper properties">',
        '<div class="table-row head">',
        '<div class="table-cell">PROPERTIES</div>',
        '<div class="table-cell">RENT</div>',
        '<div class="table-cell">SALE</div>',
        '<div class="table-cell">TOTAL</div>',
        '</div>',
        '<div class="table-row">',
        '<div class="table-cell">RESIDENTIAL</div>',
        '<div class="table-cell">#{residentialForRentCount}</div>',
        '<div class="table-cell">#{residentialForSaleCount}</div>',
        '<div class="table-cell">$(#{residentialForRentCount} + #{residentialForSaleCount})</div>',
        '</div>',
        '<div class="table-row">',
        '<div class="table-cell">COMMERCIAL</div>',
        '<div class="table-cell">#{commercialForRentCount}</div>',
        '<div class="table-cell">#{commercialForSaleCount}</div>',
        '<div class="table-cell">$(#{commercialForRentCount} + #{commercialForSaleCount})</div>',
        '</div>',
        '<div class="table-row">',
        '<div class="table-cell">TOTAL</div>',
        '<div class="table-cell">$(#{residentialForRentCount} + #{commercialForRentCount})</div>',
        '<div class="table-cell">$(#{residentialForSaleCount} + #{commercialForSaleCount})</div>',
        '<div class="table-cell">$(#{totalProperties})</div>',
        '</div>',
        '</div>',
        '<div class="desc">#{description}</div>',
        '</li>'
    ]);
    var dots = template(data_arr, ['<a href="javascript:void(0)" class="dot" ></a>']);

    var $slider = document.querySelector('.slider-wrapper .slider');
    $slider.innerHTML = $slider.innerHTML.concat(html);
    document.querySelector('.navigation-dots').innerHTML = document.querySelector('.navigation-dots').innerHTML.concat(dots);
    document.querySelector('.ajax-loader').style.display = 'none';
    $slider.style.display = 'block';
    slider.init();
}

var slider = (function() {
    var sliderWrapper, sliderEl, slides, prevArrow, nextArrow, dots;

    var init = function() {
        sliderWrapper = document.querySelector('.slider-wrapper');
        sliderEl = sliderWrapper.querySelector('.slider');
        slides = sliderEl.querySelectorAll('.slider-item');

        prevArrow = sliderWrapper.querySelector('.prev-arrow');
        nextArrow = sliderWrapper.querySelector('.arrow.next-arrow');
        dots = sliderWrapper.querySelectorAll('.dot');
        attachEvents();
        setTimeout(function() {
            gotoSlide(0);
        }, 100);
    };
    var getActiveSlideIndex = function() {
        var index = 0;
        Array.prototype.slice.call(slides).every(function(el, ind) {
            if (/(?:^|\s)active(?:\s|$)/.test(el.className)) {
                index = ind;
                return false;
            } else
                return true;
        });
        return index;
    };

    var attachEvents = function() {
        prevArrow.addEventListener('click', function(e) {
            e.preventDefault();
            if (hasClass(this, 'disable'))
                return false;
            var activeindex = getActiveSlideIndex();
            gotoSlide(activeindex - 1);
        }, false);

        nextArrow.addEventListener('click', function(e) {
            e.preventDefault();
            if (hasClass(this, 'disable'))
                return;
            var activeindex = getActiveSlideIndex();
            gotoSlide(activeindex + 1);
        }, false);

        Array.prototype.forEach.call(dots, function(dot) {
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                gotoSlide(Array.prototype.indexOf.call(dots, e.target));
            }, false);
        });
    };

    var gotoSlide = function(index) {
        var activeindex = getActiveSlideIndex();
        removeClass(sliderEl, 'slide-' + activeindex);
        addClass(sliderEl, 'slide-' + index);
        removeClass(slides[activeindex], 'active');
        addClass(slides[index], 'active');
        removeClass(dots[activeindex], 'active');
        addClass(dots[index], 'active');
        if (index == 0) {
            addClass(prevArrow, 'disable');
            removeClass(nextArrow, 'disable');
        } else if (index == slides.length - 1) {
            removeClass(prevArrow, 'disable');
            addClass(nextArrow, 'disable');
        } else {
            removeClass(prevArrow, 'disable');
            removeClass(nextArrow, 'disable');
        }

        sliderEl.style.height = index == 0 ? slides[index].offsetHeight + 100 + 'px' : slides[index].offsetHeight + 40 + 'px';


    };

    return {
        init: init,
        gotoSlide: gotoSlide
    }
})();
var timer, $slider = document.querySelector('.slider-wrapper .slider');
window.onresize = function(event) {
    clearTimeout(timer);
    timer = setTimeout(function() {
        $slider.style.height = $slider.querySelector('.slider-item.active').offsetHeight + 40 + 'px';
    }, 100);
};

function hasClass(ele, classname) {
    return new RegExp('(?:^|\\s)' + classname + '(?:\\s|$)').test(ele.className);
}

function addClass(ele, classname) {
    if (!hasClass(ele, classname))
        ele.className = ele.className.trim().concat(' ' + classname);
}

function removeClass(ele, classname) {
    ele.className = ele.className.trim().split(' ').removeByValue(classname).join(' ').trim();
}

Array.prototype.removeByValue = function(value) {
    if (this.indexOf(value) != -1)
        this.splice(this.indexOf(value), 1);
    return this;
}

function removeClassStartsWith(ele, classSubString) {
    ele.className = ele.className.trim().split(' ').removeBySubString(classSubString).join(' ').trim();
}

Array.prototype.removeBySubString = function(value) {
    return this.map(function(classname) {
        return new RegExp('^' + value).test(className) ? '' : classname;
    });
}