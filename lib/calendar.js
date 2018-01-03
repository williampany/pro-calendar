/**
 * 通用日历工具类，点击样式类pic后具有左右滑动和缩放的效果(swiper+cropper)
 *
 * @version	0.2
 * @Date    2017-12-04
 * @author	williampany, swp
 * @see     https://github.com/williampany/pro-calendar
 * @param   csspath {calendar}    CSS文件相对路径
 * @param	deps	{jquery}     所依赖的模块
 * @param	callback {Function}	回调函数
 *
 * @example
 require(['calendar'], function(calendar){

        calendar.init();  //初始化
        calendar.addRange(date_from, date_to, status, title); //添加档期
        calendar.show();  //显示日历

     });

 */
(function(){

    //----------------------------------------------------------
    /**
     * 日期操作
     *  @memberof module:calendar-internal
     * @static
     * @Class Date
     * */
    //重写toString方法，将时间转换为yyyy/MM/dd格式
    Date.prototype.toString = function(){
        var year = this.getFullYear();
        var month = this.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day = this.getDate();
        if (day < 10) day = '0' + day;
        return year + "/" + month + "/" + day;
    }
    Date.prototype.set = function(year,month,day){
        var d = new Date();
        d.setYear(year);
        d.setMonth(month - 1);
        d.setDate(day);
        return d;
    }
    Date.prototype.clone = function () {
        var d = new Date();
        d.setYear(this.getFullYear());
        d.setMonth(this.getMonth());
        d.setDate(this.getDate());
        return d;
    }
//格式化时间字符串
    Date.prototype.format = function(format){
        if(format == ""){
            return this.toString();
        }
        var str = '';

        var year = this.getFullYear();
        var month = this.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day = this.getDate();
        if (day < 10) day = '0' + day;

        var hour = this.getHours();
        if (hour < 10) hour = '0' + hour;
        var minute = this.getMinutes();
        if (minute < 10) minute = '0' + minute;
        var second = this.getSeconds();
        if (second < 10) second = '0' + second;

        str = format.replace(/Y|y/, year)
            .replace(/M|m/, month)
            .replace(/D|d/, day)
            .replace(/H|h/, hour)
            .replace(/I|i/, minute)
            .replace(/S|s/, second);
        return str;
    }
//在当前时间上添加年数
    Date.prototype.addYear = function (years) {
        var d = this.clone();
        d.setYear(d.getFullYear() + years);
        return d;
    }
//在当前时间上添加天数
    Date.prototype.addDay = function (days) {
        var d = this.clone();
        d.setDate(this.getDate() + days);
        return d;
    }
//在当前时间上添加月数
    Date.prototype.addMonth = function (months) {
        var d = this.clone();
        d.setMonth(this.getMonth() + months);
        return d;
    }
    //判断两个日期是否年月相同
    Date.prototype.equalsYearAndMonth = function(other){
        return this.getFullYear() == other.getFullYear() && this.getMonth()==other.getMonth();
    }
    Date.prototype.equals = function(other){
        return this.getFullYear() == other.getFullYear() && this.getMonth()==other.getMonth() && this.getDate()==other.getDate();
    }
    //----------------------------------------------------------

    /**
     * 添加不重复的样式类
     * @memberof module:calendar-internal
     * @params obj          对象
     *         className    样式类
     * @static
     * */
    function addClassName(obj, className){
        if(obj.className.indexOf(className) == -1 ) obj.className += ' ' + className;
    }

    /**
     * 绑定事件
     * @memberof module:calendar-internal
     * @params dom          dom对象
     *         etype        event name
     *         func         回调函数
     *         data         名称为data的事件附加参数
     * @static
     * */
    function addEvent(dom, eType, func, data) {

        if(dom.addEventListener) {  // DOM 2.0
            dom.addEventListener(eType, function(e){
                e['data'] = data;
                func(e);
            });
        } else if(dom.attachEvent){  // IE5+
            dom.attachEvent('on' + eType, function(e){
                e['data'] = data;
                func(e);
            });
        } else {  // DOM 0
            dom['on' + eType] = function(e) {
                e['data'] = data;
                func(e);
            }
        }
    }

    /**
     * DateRange, 档期对象
     * @memberof module:calendar-internal
     * @params from   开始日期
     *         to     结束日期
     *         key    关键词，与样式类对应
     *         title  档期标题
     * @static
     * @Class DateRange
     * */
    function DateRange(from, to, key, title){

        this.from = from;
        if(to) this.to = to; else this.to = from;
        if(key) this.key = key; else this.key = 'currentDay';
        if(title) this.title = title; else this.title = '今天';

    }
    /**
     * Calendar对象
     * @public
     * @Class Calendar
     * */
    var calendar = {
        headHtml : "<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>", //渲染指定日期所在的日历表格头部结构
        bodyHtml: '', //渲染指定日期所在的日历表格结构
        container: '.calendar-container', //日历容器样式类
        range: [],   //档期数组
        keys: [], //键值数组,
        callback: function(){}, //回调函数

    };

    /**
     * 初始化Calendar对象
     *
     * @params container  日历容器样式类
     *
     * @public
     * */
    calendar.init =  function(container){
        if(container) calendar.container = container;

        // 一个月最多31天，所以一个月最多占6行表格
        for(var i = 0; i < 6; i++) {

            calendar.bodyHtml += "<tr>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "</tr>";

        }

        //var today = new Date();

        //calendar.addRange(today);
    }
    /**
     * 添加档期
     *
     * @params from   开始日期
     *         to     结束日期
     *         key    关键词
     *         title  标题
     * @public
     * */
    calendar.addRange = function(from, to, key, title){

        var range = new DateRange(from, to, key, title);
        calendar.range.push(range);
        calendar.keys.push(key);

    }
    /**
     * 获取指定日期所在的日历样式类,形如 "caledaryyyymm"
     *
     * @params d   日期
     *
     * @public
     * */
    calendar.getStyleClass = function(d){

        return "calendar" + d.format('ym');
    }

    /**
     * 渲染指定日期所在的月份表格
     *
     * @params d  要渲染的日期
     *
     * @static
     * */
    calendar.renderHtml = function(d){

        var _year = d.getFullYear();
        var _month = d.getMonth() + 1;

        var data_month = d.format('ym');

        var _bodyHtml = "";

        // 指定样式类
        clz = calendar.getStyleClass(d);

        //当前月份不存在时
        if(!$("." + clz + " .bodyBox").length){

            var prev_month = '';
            var current_month =  d.format('ym');

            $(calendar.container + " .calendar").each(function(){

                var m = $(this).attr('data-month');
                if((!prev_month && current_month < m) || prev_month>m) prev_month = m;

            });
            var clz_html = "<div class="+clz+"><div class='calendar' data-month='"+ data_month + "'><div class='calendar-title-box'><span class='calendar-title'></span></div><div class='calendar-body-box'></div></div></div>";

            if(!prev_month){
                $(calendar.container).append(clz_html);
            }else{
                $(".calendar" + prev_month).before(clz_html);
            }

            $("." + clz + " .calendar-body-box").append("<div class='bodyBox'><table id='calendarTable' class='calendar-table'>" +
                calendar.headHtml + calendar.bodyHtml + "</table></div>");

        }

        // 设置顶部标题栏中的 年、月信息
        $("." + clz + " .calendar-title").html(d.format('y年m月'));

    }//end renderHtml

    /**
     * 表格中显示数据，并设置类名
     *
     * @params d  要渲染的日期
     *
     * @static
     * */
    calendar.showCalendarData = function(d){

        var _year = d.getFullYear();

        var _month = d.getMonth() + 1;

        // 设置表格中的日期数据
        clz = "." + calendar.getStyleClass(d);

        var _table = $(clz + " .calendar-table");
        var _tds = $(clz + " .bodyBox td");

        renderCell(_tds);

        function renderCell(tds){

            var _firstDay = new Date(_year, _month - 1, 1);// 当前月第一天

            for(var i = 0; i < tds.length; i++) {

                var _thisDay = new Date(_year, _month - 1, i + 1 - _firstDay.getDay());

                tds[i].innerText = _thisDay.getDate();

                //设置属性
                tds[i].setAttribute('data', _thisDay.format('ymd'));

                //----------------------------------------------------------------
                /*if(_thisDay.equals(new Date())) {    // 当前天

                    if(_thisDay.equalsYearAndMonth(_firstDay)) {
                        //当前月
                        addClassName(tds[i], 'currentDay');

                        $('.currentDay').html("<span>" + _thisDay.getDate() + "</span>")
                    }

                }else */
                if(_thisDay.equalsYearAndMonth(_firstDay)) {

                    if(_thisDay< new Date()){  //当月当天以前的日期按其它月显示
                        addClassName(tds[i], 'otherMonth');
                        continue;
                    }

                    addClassName(tds[i], 'currentMonth');

                    calendar.range.forEach(function(e){

                        var data = tds[i].getAttribute('data');

                        if(data >= e.from.format('ymd') && data <= e.to.format('ymd')){

                            addClassName(tds[i], e.key);

                            //添加click事件
                            if(!tds[i].onclick) {
                                if(_thisDay > new Date()) {
                                    addEvent(tds[i], 'click', calendar.callback, data);
                                }
                            }
                        }
                    });

                }else {    // 其他月

                    tds[i].className = 'otherMonth';

                }

            }//end for

        }//end renderCell

    }//end showCalendarData

    /**
     * 显示日历
     *
     * @params
     *
     * @spublic
     * */
    calendar.show = function(){
        var current_date = new Date(); //当前日期

        calendar.range.forEach(function(e){

            debugger;
            //renderHtml
            var arr_d = [], date_from = e.from, date_to = e.to;

            while(true){
                //只显示当前日期之后的数据
                if(date_from.format('ym') < current_date.format('ym')) {
                    if(date_to.format('ym') < current_date.format('ym')) break;
                    date_from = date_from.addMonth(1);
                }
                if(date_from <  date_to)
                    arr_d.push(date_from);
                else
                    arr_d.push(date_to);


                if(date_from.equalsYearAndMonth(date_to))
                    break;
                else {
                    //只显示6个月之内的档期
                    if(date_from.format('ym') >= current_date.addMonth(5).format('ym'))
                        break;
                    date_from = date_from.addMonth(1);
                }
            }
            //----------------------------------------

            for(var i=0; i<arr_d.length; i++){

                var d = arr_d[i];
                clzs = "." + calendar.getStyleClass(d);

                if(!$(clzs).length) calendar.renderHtml(d);

                calendar.showCalendarData(d);
            }
        });
    }

    if (typeof window != 'undefined') {
        window.calendar = calendar;
    }

})();