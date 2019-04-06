$(document).ready(function () {
    var like_arr = [];
    var dislike_arr = [];
    var fav_arr = [];

    var swiperContainer = initSwiperSlider('.main');


    var parent = $(this).parents(".img_wrap");
    var src = parent.children(".img").attr("src");

    var flickerAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
    var swiper_wrapper = $("#images_place .swiper-wrapper");
    var swiper_wrapper_liked = $("#liked_images .swiper-wrapper");
    var swiper_wrapper_disliked = $("#disliked_images .swiper-wrapper");
    var swiper_wrapper_fav = $("#favorite_images .swiper-wrapper");

    initFirebase();

    $.getJSON(flickerAPI, {
            tags: "mount rainier",
            tagmode: "any",
            format: "json"
        })
        .done(function (data) {
            // Images Loop for all Slider
            $.each(data.items, function (i, item) {
                var swiper_slide = $('<div class="swiper-slide">');
                var img_wrapper = $('<div class="img_wrapper">');
                var img_wrap = $('<div class="img_wrap">');
                var img = $("<img data-id = " + i + " class='img-responsive img'>");
                var p = $("<p class='text-center'>");
                var actions = createActionsBlock();
                swiper_wrapper.append(swiper_slide);
                $(".swiper-slide").eq(i).append(img_wrapper);
                $(".img_wrapper").eq(i).append(img_wrap);
                $(".img_wrapper").eq(i).append(p.text(item.title));
                $(".img_wrap").eq(i).append(img.attr("src", item.media.m)).append(actions);
            });
            setTimeout(function () {
                swiperContainer.update();
            });
            setClickActions();
            setHoverEffects();
        });

    function createActionsBlock() {
        var inter = $('<div class="inter">');
        var like = $('<i class="fas fa-thumbs-up like">');
        var dislike = $('<i class="fas fa-thumbs-down dislike">');
        var favorite = $('<i class="fas fa-heart heart">');

        inter.append(like, dislike, favorite);

        return inter;
    }

    function setClickActions() {
        $('.inter i').click(function () {
            $(this).toggleClass("red");
        });
        $('.like').click(function () {
            var src = $(this).parents('.img_wrap').children('.img').attr('src');
            if ($(this).next('.dislike').hasClass('red')) {
                $(this).next('.dislike').removeClass('red');
                var dislikeIndex = like_arr.indexOf(src);
                dislike_arr.splice(likeIndex, 1);
                toDisLikeSlider();
            }
            if ($(this).hasClass('red')) {
                like_arr.push(src);
                toLikeSlider();
            } else {
                var likeIndex = like_arr.indexOf(src);
                if (likeIndex > -1) {
                    like_arr.splice(likeIndex, 1);
                    toLikeSlider();
                }
            }
            setTimeout(function () {
                likesSwiper.update();
            }, 0);
        });
        $('.dislike').click(function () {
            var src = $(this).parents('.img_wrap').children('.img').attr('src');
            if ($(this).prev('.like').hasClass('red')) {
                $(this).prev('.like').removeClass('red');
                var likeIndex = like_arr.indexOf(src);
                like_arr.splice(likeIndex, 1);
                toLikeSlider();
            }
            if ($(this).hasClass('red')) {
                dislike_arr.push(src);
                toDisLikeSlider();
            } else {
                var dislikeIndex = like_arr.indexOf(src);
                dislike_arr.splice(likeIndex, 1);
                toDisLikeSlider();
            }
            setTimeout(function () {
                dislikesSwiper.update();
            }, 0);
        });
        $('.heart').click(function () {
            var image = $(this).parents('.img_wrap').children('.img');
            var src = image.attr('src');
            var imageUrl = image.attr('src');
            var id = image.data('id');

            if ($(this).hasClass('red')) {
                fav_arr.push(src);
                writeUserData('favorite', src, id);


            } else {
                var favIndex = fav_arr.indexOf(src);
                fav_arr.splice(favIndex, 1);
                writeUserData('favorite', null, id);

            }
            setTimeout(function () {
                swiperContainer.update();
            });
        });
    }

    function setHoverEffects() {
        $('.img_wrap img').hover(
            function () {
                $(this).next('.inter').show();
            },
            function () {
                $(this).next('.inter').hide();
            }
        );
        $('.inter').hover(
            function () {
                $(this).show();
            },
            function () {
                $(this).hide();
            }
        );
    }
    //SLIDERS
    function initSwiperSlider(className, options) {
        var defaultOptions = {
            paginationClickable: true,
            slidesPerView: 4,
            init: true,
            autoplay: false,
            autoplayDisableOnInteraction: false,
            breakpoints: {
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 20
                },
                991: {
                    slidesPerView: 3,
                    spaceBetween: 10
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                400: {
                    slidesPerView: 1,
                    spaceBetween: 10
                }
            },
            paginationClickable: true,
            spaceBetween: 10,
            autoplay: false,
            pagination: '.swiper-pagination',
        };
        var swiperOptions = options || defaultOptions;

        return new Swiper(className, swiperOptions);
    }

    
    function initFirebase() {
        console.log('Initialize Firebase')
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCMNjAlYZXA0R4uUIJAoO_-oXLgdZodf4k",
            authDomain: "second-task-1a215.firebaseapp.com",
            databaseURL: "https://second-task-1a215.firebaseio.com",
            projectId: "second-task-1a215",
            storageBucket: "second-task-1a215.appspot.com",
            messagingSenderId: "9323894790"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
            // Get a reference to the database service
            var myfirabase = firebase.database();
        }
    }
    function writeUserData(type, imageUrl, id) {
        firebase.database().ref('images/' + type + '/' + id).set({
            profile_picture: imageUrl
        });
    }

    function getUserData(type, id) {

        return firebase.database()
            .ref('/images/' + type)
            .once('value')
            .then(function (snapshot) {
                toFavSlider(snapshot.val());
            });
    }
    
    
    //FOR Favorite
    function toFavSlider(fav_arr) {
        console.log(fav_arr);
        swiper_wrapper_fav.empty();
        for (var f = 0; f < fav_arr.length; f++) {
            var favorite = fav_arr[f];
            swiper_wrapper_fav.append('<div class="swiper-slide"><div class="img_banner"><div class="liked_img"><img src="' + favorite.profile_picture + '" class="img-responsive"></div></div></div>');
            setTimeout(function () {
                swiperContainer.update();
            });
        }
    }
    //FOR favorite END

    getUserData('favorite', 1);
});
