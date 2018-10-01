'use strict';

var Mi = {
    init: function () {

        this.Basic.init();
        this.Components.init();

    },
    Basic: {
        init: function () {

            var self = this;

            Pace.on('done', function () {
                $('#page-loader').fadeOut(200);
                self.animations();
                // Load the map after the loading to not make loading too long
                self.map();
            });
            self.mobileDetector();
            self.backgrounds();
            self.scroller();
            self.masonry();
            self.ajaxLoader();
            self.mobileNav();

        },
        mobileDetector: function () {

            var isMobile = {
                Android: function () {
                    return navigator.userAgent.match(/Android/i);
                },
                BlackBerry: function () {
                    return navigator.userAgent.match(/BlackBerry/i);
                },
                iOS: function () {
                    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function () {
                    return navigator.userAgent.match(/Opera Mini/i);
                },
                Windows: function () {
                    return navigator.userAgent.match(/IEMobile/i);
                },
                any: function () {
                    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
                }
            };

            window.trueMobile = isMobile.any();

            if (trueMobile) {
                $('audio').remove();
            }

        },
        backgrounds: function () {

            // Images 
            $('.bg-image').each(function () {
                var src = $(this).children('img').attr('src');
                $(this).css('background-image', 'url(' + src + ')').children('img').hide();
            });

            // Slideshow 
            $('.bg-slideshow').owlCarousel({
                singleItem: true,
                autoPlay: 4000,
                pagination: false,
                navigation: false,
                navigationText: false,
                slideSpeed: 1500,
                transitionStyle: 'fade',
                mouseDrag: false,
                touchDrag: false
            });

        },
        animations: function () {
            // Animation - hover 
            $('.animated-hover')
                .on('mouseenter', function () {
                    var animation = $(this).data('hover-animation');
                    var duration = $(this).data('hover-animation-duration');
                    $(this).stop().css({
                        '-webkit-animation-duration': duration + 'ms',
                        'animation-duration': duration + 'ms'
                    }).addClass(animation);
                })
                .on('mouseleave', function () {
                    var animation = $(this).data('hover-animation');
                    var duration = $(this).data('hover-animation-duration');
                    $(this).stop().removeAttr('style').removeClass(animation);
                });

            // Animation - appear 
            $('.animated').appear(function () {
                $(this).each(function () {
                    var $target = $(this);
                    var delay = 200 + $(this).data('animation-delay');
                    setTimeout(function () {
                        $target.addClass($target.data('animation')).addClass('visible')
                    }, delay);
                });
            });

        },
        scroller: function () {

            var headerHeight = $('#header').height();
            var $section = $('.section', '#content');
            var $body = $('body');
            var scrollOffset = 0;
            if ($body.hasClass('header-horizontal')) scrollOffset = -headerHeight;

            var $scrollers = $('#header, #mobile-nav, [data-target="local-scroll"]');
            $scrollers.find('a').on('click', function () {
                $(this).blur();
            });
            $scrollers.localScroll({
                offset: scrollOffset,
                duration: 800,
                easing: $('#content').data('scroll-easing')
            });

            var $menuItem = $('#main-menu li > a, #mobile-nav li > a');
            var checkMenuItem = function (id) {
                $menuItem.each(function () {
                    var link = $(this).attr('href');
                    if (id == link) $(this).addClass('active');
                    else $(this).removeClass('active');
                });
            };
            $section.waypoint({
                handler: function (direction) {
                    if (direction == 'up') {
                        var id = '#' + this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function () {
                    if ($body.hasClass('header-horizontal')) return -this.element.clientHeight + headerHeight;
                    else return -this.element.clientHeight + 2;
                }
            });
            $section.waypoint({
                handler: function (direction) {
                    if (direction == 'down') {
                        var id = '#' + this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function () {
                    if ($body.hasClass('header-horizontal')) return headerHeight + 1;
                    else return 1;
                }
            });
            $(window).resize(function () {
                setTimeout(function () {
                    Waypoint.refreshAll()
                }, 600);
            });
        },
        masonry: function () {

            var $grid = $('.masonry');

            $grid.masonry({
                columnWidth: '.masonry-sizer',
                itemSelector: '.masonry-item',
                percentPosition: true
            });

            $grid.imagesLoaded().progress(function () {
                $grid.masonry('layout');
            });

            $grid.on('layoutComplete', Waypoint.refreshAll());

        },
        ajaxLoader: function () {

            var toLoad;
            var offsetTop;

            var $ajaxLoader = $('#ajax-loader');
            var $ajaxModal = $('#ajax-modal');
            var isAjaxModal = false;

            function showNewContent() {
                $ajaxModal.fadeIn(200, function () {
                    $('html').addClass('locked-scrolling');
                });
            }

            function loadContent() {
                $ajaxModal.load(toLoad);
            }

            $('[data-target="ajax-modal"]').on('click', function () {
                isAjaxModal = true;
                offsetTop = $(document).scrollTop();
                toLoad = $(this).attr('href');
                loadContent();
                $('body').addClass('ajax-modal-opened');
                return false;
            });

            $(document).ajaxStart(function () {
                if (isAjaxModal) $ajaxLoader.fadeIn(200);
            });
            $(document).ajaxStop(function () {
                if (isAjaxModal) $ajaxLoader.fadeOut(200, function () {
                    showNewContent();
                });
            });

            function closeDetails() {
                isAjaxModal = false;
                $('html').removeClass('locked-scrolling');
                $('body').removeClass('ajax-modal-opened');
                $(document).scrollTop(offsetTop);
                $ajaxModal.fadeOut(200).scrollTop(0);
            }

            $ajaxModal.delegate('*[data-dismiss="close"]', 'click', function () {
                closeDetails();
                return false;
            });

        },
        mobileNav: function () {
            $('[data-target="mobile-nav"]').on('click', function () {
                $('body').toggleClass('mobile-nav-open');
                return false;
            });
        },
        map: function () {
            var $googleMap = $('#google-map');

            var latitude = $googleMap.data('latitude');
            var longitude = $googleMap.data('longitude');
            var style =[
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{"color": "#808080"}, {"lightness": -32}]
                },
                {"featureType": "landscape", "stylers": [{"color": "#808080"}]},
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{"color": "#808080"}, {"lightness": -14}]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#808080"}, {"lightness": 32}]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [{"lightness": 11}, {"color": "#A46C1D"}]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#A46C1D"}, {"lightness": 11}]
                },
                {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
                {"elementType": "labels.text.fill", "stylers": [{"saturation": -100}]},
                {"featureType": "transit", "elementType": "geometry", "stylers": [{"color": "#A46C1D"}]}
            ];

            var myOptions = {
                zoom: 14,
                center: new google.maps.LatLng(latitude, longitude - 0.03),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                panControl: false,
                zoomControl: true,
                scaleControl: false,
                streetViewControl: false,
                scrollwheel: false,
                styles: style
            };

            window.map = new google.maps.Map(document.getElementById('google-map'), myOptions);

            var image = 'assets/img/my-location.png';
            var myLatLng = new google.maps.LatLng(latitude, longitude);
            var myLocation = new google.maps.Marker({
                position: myLatLng,
                map: map,
                icon: image
            });
        }
    },
    Components: {
        init: function () {
            this.modal();
            this.progressBar();
            this.tooltip();
            this.popover();
            this.videoPlayer();
            this.navToggleable();
            this.navFilter();

        },
        modal: function () {

            $('.modal').on('show.bs.modal', function () {
                $('body').addClass('modal-opened');
            });

            $('.modal').on('hide.bs.modal', function () {
                $('body').removeClass('modal-opened');
            });

            $('#mapModal').on('shown.bs.modal', function () {
                google.maps.event.trigger(map, 'resize');
            });

        },
        progressBar: function () {

            $('.progress-animated').appear(function () {
                var $bar = $(this).find('.progress-bar');
                $bar.each(function () {
                    setTimeout(function () {
                        var value = $bar.attr('aria-valuenow');
                        var i = 0;
                        setInterval(function () {
                            i++;
                            if (i <= value) {
                                $bar.children('span').text(i + '%');
                            }
                        }, 15);
                        $bar.css('width', value + '%');
                    }, 300)
                });
            });
        },
        tooltip: function () {
            $("[data-toggle='tooltip']").tooltip();
        },
        popover: function () {
            $("[rel='popover']").popover();
        },
        videoPlayer: function () {
            var $videoPlayer = $('.video-player');
            if ($videoPlayer) {
                $videoPlayer.YTPlayer();
            }
            if (trueMobile && $videoPlayer.hasClass('bg-video')) {
                $videoPlayer.prev('.bg-video-placeholder').show();
                $videoPlayer.remove()
            }
        },
        navToggleable: function () {
            $('.nav-toggleable > li.dropdown > a').on('click', function () {
                $(this).parent('li').toggleClass('active');
                return false;
            })
        },
        navFilter: function () {
            var $navFiltering = $('.nav-filter');
            $navFiltering.on('click', 'a', function () {
                var $grid = $($(this).parents('.nav-filter').data('filter-grid'));
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({
                    filter: filterValue
                });
                $(this).parents('.nav').find('.active').removeClass('active');
                $(this).parent('li').addClass('active');
                return false;
            });
        }
    }
};

$(document).ready(function () {

    Mi.init();

});
