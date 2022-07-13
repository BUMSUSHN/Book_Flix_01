

        // 좋아요 함수
        function toggle_like(post_id, type) {
            console.log(post_id, type)

            //``을 넣어서 ${}해서 post아이디를 받아온 것이고
            // aria-label='heart'인 a태그를 찾는다.
            // a태그 밑에 있는 i태그를 찾아서 i태그가 fa-heart를 가지고 있느냐 없느냐?

            let $a_like = $(`#${post_id} a[aria-label='heart']`)
            let $i_like = $a_like.find("i")
            if ($i_like.hasClass("fa-heart")) {
                $.ajax({
                    type: "POST",
                    url: "/update_like",
                    data: {
                        post_id_give: post_id,
                        type_give: type,
                        action_give: "unlike"
                    },
                    success: function (response) {
                        console.log("unlike")
                        $i_like.addClass("fa-heart-o").removeClass("fa-heart")
                        $a_like.find("span.like-num").text(num2str(response["count"]))
                    }
                })
            } else {
                $.ajax({
                    type: "POST",
                    url: "/update_like",
                    data: {
                        post_id_give: post_id,
                        type_give: type,
                        action_give: "like"
                    },
                    success: function (response) {
                        console.log("like")
                        $i_like.addClass("fa-heart").removeClass("fa-heart-o")
                        $a_like.find("span.like-num").text(num2str(response["count"]))
                    }
                })

            }
        }


        // posting 함수
        function post() {
             let url = $('#url').val();
             let star = $('#star').val();
             let comment = $('#comment').val();
            let today = new Date().toISOString()
            $.ajax({
                type: "POST",
                url: "/posting",
                data: {
                    url_give: url,
                    star_give: star,
                    comment_give:comment,
                    date_give: today
                },
                success: function (response) {
                   console.log(response);
                                window.location.reload()
                }
            })
        }

        // 포스팅 시간 함수
        function time2str(date) {
        let today = new Date()
        let time = (today - date) / 1000 / 60 // 분
            if (time < 60) {
                return parseInt(time) + "분 전"
            }
        time = time / 60 // 시간
            if (time < 24) {
                return parseInt(time) + "시간 전"
            }
        time = time / 24
            if (time < 7) {
                return parseInt(time) + "일 전"
            }
         return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
        }

        // 좋아요 형식 갯수
        function num2str(count) {
            if (count > 10000) {
                return parseInt(count / 1000) + "k"
            }
            if (count > 500) {
                return parseInt(count / 100) / 10 + "k"
            }
            if (count == 0) {
                return ""
            }
            return count
        }



        // posting card 만드는 함수

        function get_posts() {
            $("#post-box").empty()
            $.ajax({
                type: "GET",
                url: "/get_posts",
                data: {},
                success: function (response) {
                    console.log(response);

                    if (response["result"] == "success") {
                        // let posts = response["posts"] 아님.
                        let posts = response["post"]

                        for (let i = 0; i < posts.length; i++) {
                            let post = posts[i]
                            console.log(post);
                            let time_post = new Date(post["date"])

                            // 시간함수 적용
                            let time_before = time2str(time_post)

                            // 내가 누른 좋아요 표시.

                            //let class_heart = ""
                            //if (post["heart_by_me"]) {
                            //    class_heart = "fa-heart"
                            //} else {
                            //    class_heart = "fa-heart-o"
                            //}

                            // 내가 누른 좋아요 삼항 연산자.
                            let class_heart = post['heart_by_me'] ? "fa-heart": "fa-heart-o"

                            // 좋아요 총 갯수
                            let count_heart = post['count_heart'];

                            //별 갯수에 맞는 사용법
                           //.repeat(매개변수명) 자바스크립트에서 제공해주는 함수.
                           // 예제에서는 스타변수를 매개변수로 해서 star_image라는 변수에 넣었다.
                           // 따라서 밑의 ${star}를${star_image}로 변경해보자.
                           let star_image = '⭐'.repeat(post['star']);

                            // ${class_heart} 좋아요 받아옴
                            let html_temp = `<div class="box" id="${post["_id"]}">
                                                <article class="media">
                                                    <div class="media-left">
                                                        <a class="image is-64x64" href="/user/${post['username']}">
                                                            <img class="is-rounded" src="/static/${post['profile_pic_real']}"
                                                                 alt="Image">
                                                        </a>
                                                    </div>
                                                    <div class="media-content">
                                                        <div class="content">

                                                                <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                                <div class="content1">
                                                                <div>
                                                                <img class="is-rounded" src="${post['image']}"alt="Image" style="width:50%">
                                                                </div>
                                                                <div>
                                                                 ${post['title']}
                                                                <br>
                                                                 ${star_image}
                                                                <br>
                                                                <span id=dcomment>${post['comment']}</span>

                                                        <nav class="level is-mobile">
                                                            <div class="level-left">
                                                                <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post['_id']}', 'heart')">

                                                                    <span class="icon is-small"><i class="fa ${class_heart}"
                                                                                                   aria-hidden="true"></i></span>&nbsp;<span class="like-num">${count_heart}</span>
                                                                </a>
                                                            </div>

                                                        </nav>

                                                        </div>


                                                     </div>
                                                </div>

                                                    </div>
                                                </article>
                                            </div>`
                            $("#post-box").append(html_temp)
                        }
                    }
                }
            })
        }



        //서버에서 가져온 해당 포스트카드를 화면을 랜더링 하면서 실행.
        $(document).ready(function () {
            get_posts()
        })

