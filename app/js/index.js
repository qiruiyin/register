var tap = 'tap'; // 定义事件
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
var	myScroll = new IScroll('#iscroll-main', {
			preventDefault: false
		}),
		searchScroll; //搜索内容加滚动

// 获取地图数据
var mapData;
$.ajax({
	type: 'get',
	url: './js/map.json',
	async: false,
	success: function(result){
		mapData = result;
	}
});

// 整屏滚动
var status_point_num = 0,
		status_area = 0;
var mySwiper = new Swiper('.swiper-container', {
	onTouchMove: function(swiper){
		if (swiper.slides.length == 1) {
			if (status_point_num == 1) {
				swiper.appendSlide($('#point-num').html());
			} else if (status_area == 1){
				swiper.appendSlide($('#area').html());
			}
		}
		status_point_num = 0;
		status_area = 0;
	},
	onTap: function(swiper){
		if (swiper.slides.length == 1) {
			if (status_point_num == 1) {
				swiper.appendSlide($('#point-num').html());
				swiper.slideNext();
			} else if (status_area == 1){
				swiper.appendSlide($('#area').html());
				swiper.slideNext();
			}
		}
		status_point_num = 0;
		status_area = 0;
	},
	onTransitionEnd: function(swiper){
		if (swiper.activeIndex == 0) {
    	swiper.removeSlide(1);
    }
    status_point_num = 0;
		status_area = 0;
	}
});

// 网点编码
$(document.body).on('touchstart', '#point-num-show', function(e){
	e.preventDefault();
	status_point_num = 1;
}).on('touchend', '#point-num-show', function(){
	status_point_num = 0;
}).on('touchstart', '#point-num-show input', function(e){
	e.preventDefault();
});
$(document.body).on('click', '.search-result li', function(){
	$('#point-num-show').find('input').val($(this).find('span').text());
	$('#point-num-show').find('span').html($(this).find('span').text());
	mySwiper.slidePrev();
	$('.point-num .search-result ul').html('');
});
$(document.body).on(tap, '.search-btn',function(){
	var top = $('.point-num').find('header').height() + $('.point-num').find('form').height();
	$('.search-result').css({'top': top});
	for (var i = 10; i >= 0; i--) {
		$('.point-num .search-result ul').append(
			'<li>'
			+ '<label>网点编码</label>'
			+ '<span class="slide">1234567890</span>'
		+ '</li>');
	}
	
	searchScroll = new IScroll('.point-num .search-result', {
		preventDefault: false
	});
});

// 区域选择
$(document.body).on('touchstart', '.area-select', function(e){
	var id = $(this).attr('id'),
			html = "",
			cur_title, // 省市区
			area_title, // 省市区
			cur_data, // 当前地址
			data = mapData,
			$pro = $('#province').find('input'),
			$city = $('#city').find('input'),
			$district = $('#district').find('input'),
			pro = $pro.val() || '',
			city = $city.val() || '',
			district = $district.val() || '',
			pro_pos = $pro.attr('data-pos'),
			city_pos = $city.attr('data-pos'),
			$area_current = $('.area-current'), //当前地址
			$area_all = $('.area-all'); // 所有区域

	if (id == 'city' && pro === '') {
		layer.open({content: '请先选择省份'});
		return false;
	} else if (id == 'district') {
		if (pro === '') {
			layer.open({content: '请先选择省份'});
			return false;
		} else if (city === '') {
			layer.open({content: '请先选择城市'});
			return false;
		}
	}

	$('#area').find('ul').html('');
	
	if (id == 'district') {
		cur_title = '定位区县';
		area_title = '区县';
		cur_data = district;
		data = data[pro_pos].city[city_pos].area;
		for (var i =  0; i < data.length; i++) {
			if (id == 'district') {
				html += "<li>" + data[i] + "</li>";
			}
		}
	} else {
		if (id == 'city') {
			data = data[pro_pos].city;
			cur_title = '定位城市';
			area_title = '城市';
			cur_data = city;
		} else {
			cur_title = '定位省份';
			area_title = '省份';
			cur_data = pro;
		}
		for (var i =  0; i < data.length; i++) {
			html += "<li>" + data[i].name + "</li>";
		}
	}

	$area_current.find('.panel-title').html(cur_title);
	$area_all.find('.panel-title').html(area_title);
	if (cur_data != '') {
		$area_current.find('ul').addClass('current-area');
	} else {
		$area_current.find('ul').removeClass('current-area');
	}
	$area_current.find('ul').html('<li>' + cur_data + '</li>');
	$area_all.find('ul').append(html);
	$area_all.find('.panel-content').css('height', $(window).height() - $area_all.find('.panel-content')[0].offsetTop);

	status_area = 1;
}).on('touchend', '.area-select', function(e){
	e.preventDefault();
	status_area = 0;
}).on('touchstart', '.area-select input', function(e){
	e.preventDefault();
});

$(document.body).on(tap, '.area li', function(e){
	var val = $('.area-all').find('.panel-title').html(),
			obj;
	if(val == '省份') {
		obj = $('#province');
		$('#city').find('input').val('');
		$('#district').find('input').val('');
	} else if (val == '城市') {
		obj = $('#city');
		$('#district').find('input').val('');
	} else if (val == '区县') {
		obj = $('#district');
	} else {
		layer.open({content: 'error'});
	}

	obj.find('input').val($(this).html());
	obj.find('span').html($(this).html());
	obj.find('input').attr('data-pos', $(this).index());
	mySwiper.slidePrev();
});

// 副柜编码	
var codeHtml = '<li class="code-rm">'
								+ '<label>副柜编码</label>'
								+ '<input type="text">'
								+ '<div></div>'
							+ '</li>';
$(document.body).on(tap, '.code-add > div', function(){
	$(this).parent().before(codeHtml);
});
$(document.body).on(tap, '.code-rm > div', function(){
	$(this).parent().remove();
});

// 必填项
$('#submit').on(tap, function(e){
	e.preventDefault();
	var obj = $('.require').next(),
			pos = '';
	$(obj).each(function(i){
		if (obj[i].nodeName === 'INPUT' && $(this).val() === '') {
			pos = i;
			return false;
		} else if ($(this).find('span').html() === '') {
			pos = i;
			return false;
		}
	});

	if (pos !== '') {
		layer.open({content: '请填写' + $('.require').eq(pos).html()});
	} else {
		window.location.href = 'success.html';
	}
});

// 监听窗口大小变化来解决input focus问题
var windowH_init = windowH = $(window).height(),
		$cur_obj,
		scrollH = 0;
window.addEventListener('resize', function(e){
	var windowH_now = $(window).height(),
			vh = windowH - windowH_now, // 视口改变大小
			top = $cur_obj.offset().top - $(window).scrollTop(), // 焦点元素距顶部的距离
			num = $('.main li').index($cur_obj.parent()),
			bottom = $cur_obj.parents('.input-msg').height() - num * $cur_obj.height();
	if (top + vh + $cur_obj.height() > windowH_init) {
		scrollH = vh + top - windowH_init + $cur_obj.height();
		$('#iscroll-main .input-msg').css('margin-top', -scrollH);
	} else {
		$('#iscroll-main .input-msg').css('margin-top', 0);
	}
	windowH = windowH_now;
});

$('.main input').on('focus', function(){
	$cur_obj = $(this);
});