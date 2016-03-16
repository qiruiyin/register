(function(){
	var tap = 'tap'; // 定义事件
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
	var status_node = 0,
			status_area = 0;
	var mySwiper = new Swiper('.swiper-container', {
		onTouchMove: function(swiper){
			if (swiper.slides.length == 1) {
				if (status_node == 1) {
					swiper.appendSlide($('#node').html());
				} else if (status_area == 1){
					swiper.appendSlide($('#area').html());
				}
			}
		},
		onTransitionEnd: function(swiper){
			 if (swiper.activeIndex == 0) {
      	swiper.removeSlide(1);
      }
		}
	});

	// 网点编码
	$(document.body).on('touchstart', '#node-show', function(){
		status_node = 1;
	}).on('touchend', '#node-show', function(){
		status_node = 0;
	});
	$(document.body).on('click', '#point-num-select > li', function(){
		$('#node-show').find('input').val($(this).find('span').text());
		mySwiper.slidePrev();
	});

	// 区域选择
	$(document.body).on('touchstart', '.area-select', function(){
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
				$area_current = $('#area-current'), //当前地址
				$area_all = $('#area-all'); // 所有区域

		if (id == 'city' && pro === '') {
			alert('请先选择省份');
			return false;
		} else if (id == 'district') {
			if (pro === '') {
				alert('请先选择省份');
				return false;
			} else if (city === '') {
				alert('请先选择城市');
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
	}).on('touchend', '.area-select', function(){
		status_area = 0;
	});

	$(document.body).on(tap, '.area li', function(e){
		var val = $('#area-all').find('.panel-title').html(),
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
			alert('error');
		}

		obj.find('input').val($(this).html());
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
			dialog('请填写' + $('.require').eq(pos).html());
		} else {
			window.location.href = 'success.html';
		}
	});
})();