import React, { Component, useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import "./style.css";


/**
 * IntersectionObserver api虚拟列表滚动和懒加载的例子
 */
const MAX_SCROLL_COUNT = 6;

function App() {
  const list = Array.from({ length: 100 }).map((el:any,i)=>{
    return el = { index : i}
  })
  //虚拟列表相关
  const [startIndex, setStartIndex] = useState(0);
  const scrollElement = useRef<any>({});
  const bottomRef = useRef<any>({});
  const topRef = useRef<any>({});

  useEffect(() => {
    const options = {
      root: null,
      threshold: 1 // 阀值设为1，当只有比例达到1时才触发回调函数
    };
    const lazyLoadObserver = new IntersectionObserver((entries: any) => {
      entries.forEach(entry => {
        //到可视区
        if (entry.isIntersecting) {
          console.log(entry);
          const imgDom = entry.target;
          imgDom.style.backgroundImage = `url(${imgDom.dataset.src})`;
          lazyLoadObserver.unobserve(imgDom);
        }
      });
    }, options);
    const imgList = Array.from(document.querySelectorAll(".lazy"));
    imgList.forEach(el => {
      lazyLoadObserver.observe(el);
    });

    /**
     * 监听触底和触顶更新要展示的列表
     */
    new IntersectionObserver(entries => {
        let isScroll = true;
        let item = entries[0];
        if (item.isIntersecting) {
            setStartIndex(pre => {
                if (pre + MAX_SCROLL_COUNT >= list.length) {
                    isScroll = false;
                    return pre;
                }
                return pre + MAX_SCROLL_COUNT;
            });
            isScroll && scrollElement.current?.scrollIntoView();
        }
    }, options).observe(bottomRef.current); // 监听底部参照元素

    new IntersectionObserver(entries => {
        let isScroll = true;
        let item = entries[0];
        if (item.isIntersecting) {
            setStartIndex(pre => {
                if (pre - MAX_SCROLL_COUNT < 0) {
                    isScroll = false;
                    return pre;
                }
                return pre - MAX_SCROLL_COUNT;
            });
            isScroll && scrollElement.current?.scrollIntoView();
        }
    }, options).observe(topRef.current); // 监听顶部参照元素
  }, []);

  const setUpdateList = () => {
    //如果要截取的长度大于了海报的列表的长度，截取倒数的最后几个列表
    if (startIndex + MAX_SCROLL_COUNT > list.length) {
      return list.slice(-MAX_SCROLL_COUNT);
    }
    return list.slice(startIndex, startIndex + MAX_SCROLL_COUNT);
  };

  const updateList = setUpdateList();

  return (
    <div>
      <ul>
        <div style={{height:'50px'}} ref={topRef}>顶部</div>
        {updateList.map((el, index) => {
          return (
            <li  ref={index === 0 ? scrollElement : null}>
              <div
                className="lazy img-wrap"
                data-src="https://big-c.oss-cn-hangzhou.aliyuncs.com/cms/img/6i7elyk58pcsvexb1rlu5jguqgotra33封"
              />
              {el.index}
            </li>
          );
        })}
        <div style={{height:'50px'}} ref={bottomRef}>底部</div>
      </ul>
    </div>
  );
}

render(<App />, document.getElementById("root"));
