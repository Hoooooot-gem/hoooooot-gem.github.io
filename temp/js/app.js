!function() {
    const t = Math.floor
      , e = Math.ceil
      , n = Math.round
      , o = Math.abs
      , i = Math.min
      , s = Math.max
      , a = Math.sqrt
      , l = Math.cbrt
      , r = Math.pow;
    function c(t) {
        return t < 0 ? 0 : t > 1 ? 1 : t
    }
    const h = [0, 0, 0]
      , u = [0, 0, 0]
      , d = [0, 0, 0]
      , p = [0, 0, 0]
      , f = [0, 0, 0]
      , m = [0, 0, 0]
      , g = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]]
      , v = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [1, 1, 1]]
      , w = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1]]
      , b = [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 1, 1]]
      , x = [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]
      , $ = [[0, 0, 0], [0, 0, 1], [0, 1, 1], [1, 1, 1]];
    function y(n, o, i, s, a, l) {
        const r = i * (o - 1)
          , c = s * (o - 1)
          , y = a * (o - 1)
          , _ = t(r)
          , T = t(c)
          , k = t(y);
        if (_ === r && T === c && k === y)
            L(n, o, r, c, y, l);
        else {
            const t = e(r)
              , i = e(c)
              , s = e(y)
              , a = r - _
              , C = c - T
              , M = y - k;
            let E;
            a >= C && C >= M ? E = g : a >= M && M >= C ? E = v : M >= a && a >= C ? E = w : C >= a && a >= M ? E = b : C >= M && M >= a ? E = x : M >= C && C >= a && (E = $);
            const [U,I,D,A] = E
              , O = h;
            O[0] = a,
            O[1] = C,
            O[2] = M;
            const j = u
              , S = t - _
              , N = i - T
              , P = s - k;
            j[0] = S * U[0] + _,
            j[1] = N * U[1] + T,
            j[2] = P * U[2] + k,
            L(n, o, j[0], j[1], j[2], d),
            j[0] = S * I[0] + _,
            j[1] = N * I[1] + T,
            j[2] = P * I[2] + k,
            L(n, o, j[0], j[1], j[2], p),
            j[0] = S * D[0] + _,
            j[1] = N * D[1] + T,
            j[2] = P * D[2] + k,
            L(n, o, j[0], j[1], j[2], f),
            j[0] = S * A[0] + _,
            j[1] = N * A[1] + T,
            j[2] = P * A[2] + k,
            L(n, o, j[0], j[1], j[2], m);
            const F = 6 * z(I, D, A, O)
              , R = 6 * z(U, D, A, O)
              , H = 6 * z(U, I, A, O)
              , Z = 6 * z(U, I, D, O);
            d[0] *= F,
            d[1] *= F,
            d[2] *= F,
            p[0] *= R,
            p[1] *= R,
            p[2] *= R,
            f[0] *= H,
            f[1] *= H,
            f[2] *= H,
            m[0] *= Z,
            m[1] *= Z,
            m[2] *= Z,
            l[0] = d[0] + p[0] + f[0] + m[0],
            l[1] = d[1] + p[1] + f[1] + m[1],
            l[2] = d[2] + p[2] + f[2] + m[2]
        }
    }
    function z(t, e, n, i) {
        const s = n[0] - e[0]
          , l = n[1] - e[1]
          , r = n[2] - e[2]
          , c = t[0] - e[0]
          , h = t[1] - e[1]
          , u = t[2] - e[2]
          , d = l * u - r * h
          , p = r * c - s * u
          , f = s * h - l * c
          , m = a(d * d + p * p + f * f)
          , g = .5 * m
          , v = d / m
          , w = p / m
          , b = f / m
          , x = -(t[0] * v + t[1] * w + t[2] * b)
          , $ = i[0] * v + i[1] * w + i[2] * b;
        return o($ + x) * g / 3
    }
    function L(t, e, n, o, i, s) {
        const a = 3 * (n + o * e + i * e * e);
        s[0] = t[a],
        s[1] = t[a + 1],
        s[2] = t[a + 2]
    }
    const _ = [0, 0, 0]
      , T = [0, 0, 0]
      , k = [0, 0, 0]
      , C = [0, 0, 0]
      , M = [0, 0, 0]
      , E = [0, 0, 0]
      , U = [0, 0, 0]
      , I = [0, 0, 0]
      , D = [0, 0, 0]
      , A = [0, 0, 0]
      , O = [0, 0, 0]
      , j = [0, 0, 0]
      , S = [0, 0, 0]
      , N = [0, 0, 0]
      , P = [0, 0, 0];
    function F(e, o) {
        const i = l(e.length / 3);
        return i < o ? function(t, e) {
            const o = l(t.length / 3);
            for (let e = 0; e < t.length; e++)
                t[e] = c(t[e]);
            if (o === e)
                return [...t];
            const i = [0, 0, 0]
              , s = new Array(e ** 3 * 3)
              , a = 1 / (e - 1);
            for (let l = 0; l < e; ++l)
                for (let r = 0; r < e; ++r)
                    for (let c, h, u, d, p = 0; p < e; ++p)
                        c = p * a,
                        h = r * a,
                        u = l * a,
                        d = 3 * n(p + r * e + l * e * e),
                        y(t, o, c, h, u, i),
                        s[d] = i[0],
                        s[d + 1] = i[1],
                        s[d + 2] = i[2];
            return s
        }(e, o) : i > o ? ( (e, n) => {
            const o = l(e.length / 3);
            for (let t = 0; t < e.length; t++)
                e[t] = c(e[t]);
            if (o === n)
                return [...e];
            const i = o * o
              , s = (o - 1) / (n - 1)
              , a = new Array(n ** 3 * 3)
              , r = o - 1;
            let h = 0
              , u = 0
              , d = 0
              , p = 0
              , f = 0
              , m = 0
              , g = 0;
            for (let l = 0; l < n; l++)
                for (let c = 0; c < n; c++)
                    for (let v = 0; v < n; v++)
                        h = t(l * s),
                        u = h < 0 ? 0 : h > r ? r : h,
                        h = u + 1,
                        d = h < 0 ? 0 : h > r ? r : h,
                        h = t(c * s),
                        p = h < 0 ? 0 : h > r ? r : h,
                        h = p + 1,
                        f = h < 0 ? 0 : h > r ? r : h,
                        h = t(v * s),
                        m = h < 0 ? 0 : h > r ? r : h,
                        h = m + 1,
                        g = h < 0 ? 0 : h > r ? r : h,
                        h = 3 * (u * i + p * o + m),
                        _[0] = e[h],
                        _[1] = e[h + 1],
                        _[2] = e[h + 2],
                        h = 3 * (u * i + p * o + g),
                        T[0] = e[h],
                        T[1] = e[h + 1],
                        T[2] = e[h + 2],
                        h = 3 * (d * i + p * o + m),
                        k[0] = e[h],
                        k[1] = e[h + 1],
                        k[2] = e[h + 2],
                        h = 3 * (u * i + f * o + m),
                        C[0] = e[h],
                        C[1] = e[h + 1],
                        C[2] = e[h + 2],
                        h = 3 * (d * i + p * o + g),
                        M[0] = e[h],
                        M[1] = e[h + 1],
                        M[2] = e[h + 2],
                        h = 3 * (d * i + f * o + g),
                        E[0] = e[h],
                        E[1] = e[h + 1],
                        E[2] = e[h + 2],
                        h = 3 * (d * i + f * o + m),
                        U[0] = e[h],
                        U[1] = e[h + 1],
                        U[2] = e[h + 2],
                        h = 3 * (u * i + f * o + g),
                        I[0] = e[h],
                        I[1] = e[h + 1],
                        I[2] = e[h + 2],
                        h = 1 - (d - l * s),
                        D[0] = _[0] + (k[0] - _[0]) * h,
                        D[1] = _[1] + (k[1] - _[1]) * h,
                        D[2] = _[2] + (k[2] - _[2]) * h,
                        A[0] = T[0] + (M[0] - T[0]) * h,
                        A[1] = T[1] + (M[1] - T[1]) * h,
                        A[2] = T[2] + (M[2] - T[2]) * h,
                        O[0] = C[0] + (U[0] - C[0]) * h,
                        O[1] = C[1] + (U[1] - C[1]) * h,
                        O[2] = C[2] + (U[2] - C[2]) * h,
                        j[0] = I[0] + (E[0] - I[0]) * h,
                        j[1] = I[1] + (E[1] - I[1]) * h,
                        j[2] = I[2] + (E[2] - I[2]) * h,
                        h = 1 - (g - v * s),
                        S[0] = O[0] + (j[0] - O[0]) * h,
                        S[1] = O[1] + (j[1] - O[1]) * h,
                        S[2] = O[2] + (j[2] - O[2]) * h,
                        N[0] = D[0] + (A[0] - D[0]) * h,
                        N[1] = D[1] + (A[1] - D[1]) * h,
                        N[2] = D[2] + (A[2] - D[2]) * h,
                        h = 1 - (f - c * s),
                        P[0] = N[0] + (S[0] - N[0]) * h,
                        P[1] = N[1] + (S[1] - N[1]) * h,
                        P[2] = N[2] + (S[2] - N[2]) * h,
                        h = 3 * (l * n * n + c * n + v),
                        a[h] = P[0],
                        a[h + 1] = P[1],
                        a[h + 2] = P[2];
            return a
        }
        )(e, o) : e
    }
    function R(t, e, n=64, o=6, i=!1) {
        t = F(t, n);
        const s = i ? ["# " + e, "# Created with Coooooolour by Hoooooot", "", "LUT_3D_SIZE " + n] : ["", 'TITLE "' + e + ' - Created with Coooooolour"', "", "LUT_3D_SIZE " + n, "", "DOMAIN_MIN 0.0 0.0 0.0", "DOMAIN_MAX 1.0 1.0 1.0", ""];
        for (let e = 0; e < t.length; e += 3)
            s.push(t[e].toFixed(o) + " " + t[e + 1].toFixed(o) + " " + t[e + 2].toFixed(o));
        return s.push(""),
        s.join("\n")
    }
    function H(t, e, n) {
        return n < t ? t : n > e ? e : n
    }
    const Z = /TITLE +"([^"]*)"/
      , B = /LUT_3D_SIZE +(\d+)/
      , q = /^([-?\d.]+) +([-?\d.]+) +([-?\d.]+) *$/gm;
    function V(t, e="anonymous") {
        return new Promise(( (n, o) => {
            if (t instanceof HTMLImageElement || t instanceof HTMLCanvasElement)
                n(t);
            else {
                const i = new Image;
                i.setAttribute("crossorigin", e),
                i.onload = () => {
                    n(i)
                }
                ,
                i.onerror = t => {
                    o(t)
                }
                ,
                i.src = "string" == typeof t ? t : URL.createObjectURL(t)
            }
        }
        ))
    }
    const G = (t, e) => {
        const n = e.canvas || document.createElement("canvas")
          , o = t.naturalWidth || t.width
          , i = t.naturalHeight || t.height;
        let s = 0
          , a = n.width = o
          , l = n.height = i;
        e.maxWidth || e.maxHeight ? (a > e.maxWidth && (s = e.maxWidth / a,
        n.width = e.maxWidth,
        n.height = l * s,
        a *= s,
        l *= s),
        l > e.maxHeight && (s = e.maxHeight / l,
        n.height = e.maxHeight,
        n.width = a * s)) : (e.width || e.height) && (e.width && e.height ? (n.width = e.width,
        n.height = e.height) : e.width ? (s = e.width / a,
        n.width = e.width,
        n.height = l * s) : e.height && (s = e.height / l,
        n.height = e.height,
        n.width = a * s));
        const r = n.getContext("2d");
        return r.drawImage(t, 0, 0, o, i, 0, 0, n.width, n.height),
        r
    }
      , W = new Float32Array(1)
      , X = new Int32Array(W.buffer)
      , J = new Int32Array(1)
      , K = new Float32Array(J.buffer);
    function Q(t) {
        W[0] = t;
        const e = X[0];
        let n = e >> 16 & 32768
          , o = e >> 12 & 2047
          , i = e >> 23 & 255;
        return i < 103 ? n : i > 142 ? (n |= 31744,
        n |= (255 === i ? 0 : 1) && 8388607 & e,
        n) : i < 113 ? (o |= 2048,
        n |= (o >> 114 - i) + (o >> 113 - i & 1),
        n) : (n |= i - 112 << 10 | o >> 1,
        n += 1 & o,
        n)
    }
    function Y(t) {
        let e = ((32767 & t) << 13) + (112 << 23);
        const n = 260046848
          , o = n & e;
        if (o === n)
            e += 112 << 23;
        else if (0 === o) {
            J[0] = 113 << 23;
            const t = K[0];
            e += 1 << 23,
            J[0] = e,
            W[0] = K[0] - t,
            e = X[0]
        }
        return e |= (32768 & t) << 16,
        J[0] = e,
        K[0]
    }
    const tt = new Map([[8, {
        size: 8,
        width: 32,
        height: 16,
        cols: 4,
        rows: 2
    }], [16, {
        size: 16,
        width: 64,
        height: 64,
        cols: 4,
        rows: 4
    }], [24, {
        size: 24,
        width: 576,
        height: 24,
        cols: 24,
        rows: 1
    }], [32, {
        size: 32,
        width: 256,
        height: 128,
        cols: 8,
        rows: 4
    }], [48, {
        size: 48,
        width: 2304,
        height: 48,
        cols: 48,
        rows: 1
    }], [64, {
        size: 64,
        width: 512,
        height: 512,
        cols: 8,
        rows: 8
    }], [96, {
        size: 96,
        width: 9216,
        height: 96,
        cols: 96,
        rows: 1
    }], [128, {
        size: 128,
        width: 2048,
        height: 1024,
        cols: 16,
        rows: 8
    }]]);
    function et(e, n="xyz") {
        const o = n[0]
          , i = n[1]
          , s = n[2]
          , a = {
            x: 0,
            y: 0,
            z: 0
        }
          , {size: r, width: h, cols: u} = tt.get(l(e.length / 3))
          , d = r * r * r
          , p = [];
        for (let t = 0; t < e.length; t++)
            e[t] = c(e[t]);
        for (let n, l, c, f, m, g, v = 0; v < d; v++)
            n = t(v / r),
            a[o] = v % r,
            a[i] = n % r,
            a[s] = t(n / r),
            f = a.z % u,
            m = t(a.z / u),
            l = t(f * r + a.x),
            c = t(m * r + a.y),
            g = 3 * t(c * h + l),
            p.push(e[g], e[g + 1], e[g + 2]);
        return p
    }
    function nt(t, e=null) {
        e = e || t;
        for (let n = 0; n < t.length; n++)
            e[n] = t[n] / 255;
        return e
    }
    function ot(t, e) {
        t !== window && t !== document && t !== document.documentElement || (t = document.body);
        const n = ot.h || (ot.h = new Map);
        n.has(t) ? n.get(t).push(e) : n.set(t, [e]),
        (ot.o || (ot.o = new ResizeObserver((t => {
            for (let e, o, i = 0; i < t.length; i++)
                if (e = t[i],
                o = n.get(e.target),
                o)
                    for (let t = 0; t < o.length; t++)
                        o[t](e)
        }
        )))).observe(t)
    }
    function it(e, n="xyz") {
        const o = n[0]
          , i = n[1]
          , s = n[2]
          , a = {
            x: 0,
            y: 0,
            z: 0
        }
          , {size: r, width: h, height: u, cols: d} = tt.get(l(e.length / 3))
          , p = r * r
          , f = [];
        for (let t = 0; t < e.length; t++)
            e[t] = c(e[t]);
        for (let n, l = 0; l < u; l++) {
            n = t(l / r),
            a.y = l % r;
            for (let l, c, u = 0; u < h; u++)
                l = t(u / r),
                a.x = u % r,
                a.z = t(n * d + l),
                c = 3 * t(a[o] + r * a[i] + p * a[s]),
                f.push(e[c], e[c + 1], e[c + 2])
        }
        return f
    }
    function st(t, e=32) {
        const n = 32 === e ? 1 : 255
          , o = [];
        for (let e = 0; e < t.length; e += 3)
            o.push(t[e], t[e + 1], t[e + 2], n);
        for (let e = 0; e < o.length; e++)
            t[e] = o[e];
        return t
    }
    function at(t, e=null) {
        e = e || t;
        for (let n = 0; n < t.length; n++)
            e[n] = i(s(255 * t[n], 0), 255);
        return e
    }
    const lt = [0, 0, 0]
      , rt = [0, 0, 0]
      , ct = [0, 0, 0]
      , ht = [0, 0, 0]
      , ut = [0, 0, 0]
      , dt = [0, 0, 0]
      , pt = [0, 0, 0]
      , ft = [0, 0, 0];
    function mt(o, i) {
        if (i.width !== i.height)
            throw new Error("Square Texture required.");
        const s = o.data
          , a = o.width
          , l = o.height
          , c = i.data
          , h = t(r(i.width, 1 / 3) + .001)
          , u = h * h
          , d = u - 1
          , p = o.width * o.height == o.data.length / 4 ? 4 : 3
          , f = i.width * i.height == i.data.length / 4 ? 4 : 3;
        for (let o, i, r, h, m, g, v, w, b, x, $, y, z = 0; z < l; z++)
            for (let l = 0; l < a; l++)
                o = (z * a + l) * p,
                i = s[o] / 256 * d,
                r = s[o + 1] / 256 * d,
                h = s[o + 2] / 256 * d,
                m = s[o + 3] / 256,
                g = t(i),
                v = e(i),
                w = t(r),
                b = e(r),
                x = t(h),
                $ = e(h),
                y = (x * u * u + w * u + g) * f,
                lt[0] = c[y],
                lt[1] = c[y + 1],
                lt[2] = c[y + 2],
                y = ($ * u * u + w * u + g) * f,
                rt[0] = c[y],
                rt[1] = c[y + 1],
                rt[2] = c[y + 2],
                y = (x * u * u + b * u + g) * f,
                ct[0] = c[y],
                ct[1] = c[y + 1],
                ct[2] = c[y + 2],
                y = ($ * u * u + b * u + g) * f,
                ht[0] = c[y],
                ht[1] = c[y + 1],
                ht[2] = c[y + 2],
                y = (x * u * u + w * u + v) * f,
                ut[0] = c[y],
                ut[1] = c[y + 1],
                ut[2] = c[y + 2],
                y = ($ * u * u + w * u + v) * f,
                dt[0] = c[y],
                dt[1] = c[y + 1],
                dt[2] = c[y + 2],
                y = (x * u * u + b * u + v) * f,
                pt[0] = c[y],
                pt[1] = c[y + 1],
                pt[2] = c[y + 2],
                y = ($ * u * u + b * u + v) * f,
                ft[0] = c[y],
                ft[1] = c[y + 1],
                ft[2] = c[y + 2],
                y = h - x,
                lt[0] = lt[0] + (rt[0] - lt[0]) * y,
                lt[1] = lt[1] + (rt[1] - lt[1]) * y,
                lt[2] = lt[2] + (rt[2] - lt[2]) * y,
                ct[0] = ct[0] + (ht[0] - ct[0]) * y,
                ct[1] = ct[1] + (ht[1] - ct[1]) * y,
                ct[2] = ct[2] + (ht[2] - ct[2]) * y,
                ut[0] = ut[0] + (dt[0] - ut[0]) * y,
                ut[1] = ut[1] + (dt[1] - ut[1]) * y,
                ut[2] = ut[2] + (dt[2] - ut[2]) * y,
                pt[0] = pt[0] + (ft[0] - pt[0]) * y,
                pt[1] = pt[1] + (ft[1] - pt[1]) * y,
                pt[2] = pt[2] + (ft[2] - pt[2]) * y,
                y = r - w,
                lt[0] = lt[0] + (ct[0] - lt[0]) * y,
                lt[1] = lt[1] + (ct[1] - lt[1]) * y,
                lt[2] = lt[2] + (ct[2] - lt[2]) * y,
                ut[0] = ut[0] + (pt[0] - ut[0]) * y,
                ut[1] = ut[1] + (pt[1] - ut[1]) * y,
                ut[2] = ut[2] + (pt[2] - ut[2]) * y,
                y = i - g,
                lt[0] = lt[0] + (ut[0] - lt[0]) * y,
                lt[1] = lt[1] + (ut[1] - lt[1]) * y,
                lt[2] = lt[2] + (ut[2] - lt[2]) * y,
                s[o] = n(256 * lt[0]),
                s[o + 1] = n(256 * lt[1]),
                s[o + 2] = n(256 * lt[2]),
                s[o + 3] = 256 * m;
        return o
    }
    function gt(t, e, n) {
        if (e === n)
            return t;
        if (32 === e) {
            if (8 === n)
                at(t);
            else if (16 === n)
                for (let e = 0; e < t.length; e++)
                    t[e] = Q(t[e])
        } else if (16 === e) {
            for (let e = 0; e < t.length; e++)
                t[e] = Y(t[e]);
            8 === n && at(t)
        } else if (8 === e && (nt(t),
        16 === n))
            for (let e = 0; e < t.length; e++)
                t[e] = Q(t[e]);
        return t
    }
    function vt(t, e=32) {
        const n = t - 1
          , o = [];
        for (let e = 0; e < t; e++)
            for (let i = 0; i < t; i++)
                for (let s = 0; s < t; s++)
                    o.push(s / n, i / n, e / n);
        return 32 === e ? o : 16 === e ? gt(o, 32, 16) : 8 === e ? gt(o, 32, 8) : void 0
    }
    const wt = 0
      , bt = 1
      , xt = 2
      , $t = 3
      , yt = 4
      , zt = 8;
    (function t(e, n) {
        const [o,i] = t.x || (t.x = [Symbol(), Symbol()])
          , s = n.element ? Object.assign(document.createElement("template"), {
            innerHTML: n.element
        }).content : null
          , a = !!s && null !== s.querySelector("slot")
          , l = t.y || (t.y = {
            get: (t, e) => t.querySelector(`[ref="${e}"]`)
        });
        if (n.style) {
            (t.z || (t.z = document.head.appendChild(document.createElement("style")))).innerHTML += n.style.replaceAll(":host", `:is(${e}, [extends*="${e}"])`)
        }
        class r extends HTMLElement {
            static use() {
                return this[o] || (this[o] = !0,
                customElements.define(e, this)),
                e
            }
            static extend(o, i) {
                const {element: s, style: a, initialize: l, ...r} = n;
                return t(o, Object.assign(r, i, {
                    extends: this.prototype.extends ? `${this.prototype.extends} ${e}` : e,
                    element: (s || "") + (i.element || ""),
                    initialize(t) {
                        l && l.call(this, t),
                        i.initialize && i.initialize.call(this, t)
                    }
                }))
            }
            static html(t="", n="") {
                return this.use(),
                `<${e} ${t}>${n}</${e}>`
            }
            connectedCallback() {
                this[i] || (this[i] = !0,
                n.extends && this.setAttribute("extends", n.extends),
                s && (this.appendChild(s.cloneNode(!0)),
                a && this.querySelectorAll("slot").forEach((t => {
                    const e = this.querySelectorAll(`[slot="${t.getAttribute("name")}"]`);
                    e.length && t.after(...e),
                    t.remove()
                }
                ))),
                n.initialize && n.initialize.call(this, new Proxy(this,l)))
            }
        }
        const {element: c, style: h, ...u} = Object.getOwnPropertyDescriptors(n);
        return Object.defineProperties(r.prototype, u),
        r
    }
    )("lut-converter", {
        // element: `\n    <header class="flex-row y-bottom pd-050 gap-050 text-m wrap">\n      <input ref="$fileLoader" type="file" accept=".cube, image/png" multiple hidden>\n      <input ref="$imgLoader" type="file" accept="image/jpeg, image/png" hidden>\n      <a ref="$downloader" rel="noopener" href="" download="" style="display:none"></a>\n      <div class="flex-col gap-025">\n        <span class="label text-xs">3D LUTs</span>\n        <button data-action="load-luts" class="action-button text-s text-semibold rounded-100">Add LUT(s)</button>\n      </div>\n      <div class="flex-col gap-025 mg-r-auto">\n        <span class="label text-xs">Preview</span>\n        <button data-action="load-image" class="action-button text-s text-semibold rounded-100">Load Image</button>\n      </div>\n      <div class="flex-col gap-025">\n        <span class="label text-xs">Output</span>\n        <select data-setting="lut-destination" class="select">\n            <option value="">--- Select Format ---</option>\n          <optgroup label="3D LUT for Applications">\n            <option value="${wt}" data-sizes="32,33,64,65">Davinci Resolve</option>\n            <option value="${wt}" data-sizes="16,32,64">Photoshop</option>\n            <option value="${wt}" data-sizes="16,32,64">Premiere</option>\n            <option value="${wt}" data-sizes="16,32,64">After Effects</option>\n            <option value="${wt}" data-sizes="16,32,64">Final Cut Pro</option>\n            <option value="${wt}" data-sizes="16,32,64">Affinity Photo</option>\n            <option value="${wt}" data-sizes="16,32,64">Darktable</option>\n            <option value="${wt}" data-sizes="16,32,64">LumaFusion</option>\n            <option value="${bt}"  data-sizes="17,33,65">OCIO spi3d</option>\n            <option value="${wt}" data-sizes="16,17,32,33,64,65">Cube Generic</option>\n            <option value="${zt}" data-sizes="16,17,32,33,64,65">CSV</option>\n          </optgroup>\n          <optgroup label="3D LUT for Cameras">\n            <option value="${xt}" data-sizes="33">Canon CLUT</option>\n            <option value="${wt}" data-sizes="17,33">Blackmagic Camera</option>\n            <option value="${wt}" data-sizes="17,33">Blackmagic Video Assist</option>\n            <option value="${wt}" data-sizes="33">Arri Color Tool</option>\n            <option value="${$t}" data-sizes="17">Panasonic Varicam</option>\n          </optgroup>\n          <optgroup label="3D LUT for 3D Engines">\n            <option value="${wt}" data-sizes="16,32,64">Unreal Engine</option>\n            <option value="5" data-sizes="32">Unity</option> \n            <option value="${yt}" data-sizes="16,32,64">Cinema 4D Redshift</option>\n          </optgroup>\n          <optgroup label="LUT PNG Textures">\n            <option value="5" data-sizes="16,32,64">Cube Strip 2D</option>\n            <option value="6" data-sizes="16,32,64">Cube Grid 2D</option>\n            <option value="7" data-sizes="16,32,64">Hald CLUT 3D</option>\n          </optgroup>\n        </select>\n      </div>\n      <div class="flex-col gap-025">\n        <span class="label text-xs">Size</span>\n        <select data-setting="lut-size" class="select flex-grow min-w-250">\n          <option value="16">16³</option>\n          <option value="17">17³</option>\n          <option value="32">32³</option>\n          <option value="33">33³</option>\n          <option value="64" selected>64³</option>\n          <option value="65">65³</option>\n        </select>\n      </div>\n      <button data-action="convert-lut" class="action-button primary text-s text-semibold rounded-100 pd-l-150 pd-r-075 pd-y-050 flex-row center gap-100">\n        <span>Export LUT</span>\n        <svg class="w-075 h-075" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 18">\n          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 16H2"/>\n          <path class="export-arrow" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m2 6 5 5 5-5m-5 4V1"/>\n        </svg>\n      </button>\n    </header>\n    <section>\n      <lut-list ref="$lutList" class="flex-col gap-050 pd-050 overflow-y-auto"></lut-list>\n      <view-port class="pd-050"><canvas ref="$cvs" class="w-full h-full"></canvas></view-port>\n    </section>\n  `,
        // style: '\n    :host {\n      position: relative;\n      width: 100%;\n      height: 100%;\n      background-color: inherit;\n      display: grid;\n      grid-template-rows: min-content 1fr;\n      grid-template-areas: "header" "main";\n    }\n    :host header {\n      grid-area: header;\n    }\n    :host header,\n    :host lut-list {\n      background-color: var(--theme-surface-050);\n    }\n    :host section {\n      grid-area: main;\n      display: grid;\n      grid-template-columns: 225px 1fr;\n    }\n    @media (orientation: portrait) {\n      :host section {\n        grid-template-columns: 1fr;\n        grid-template-rows: 100px 1fr;\n      }\n    }\n    :host .lut-file {\n      background-color: var(--theme-higher-000);\n    }\n    :host .lut-file .remove-icon,\n    :host .lut-file:not(.default-lut):hover .lut-icon {\n      display: none;\n    }\n    :host .lut-file:not(.default-lut):hover .remove-icon {\n      display: block;\n    }\n    :host .lut-file.selected {\n      background-color: var(--theme-primary-subtle);\n    }\n  ',
        initialize({$fileLoader: t, $imgLoader: e, $downloader: n, $lutList: o, $cvs: i}) {
            this.t = this.querySelector('[data-setting="lut-destination"]'),
    //         this.t.onchange = function () {
    //   var indexs = selects.selectedIndex;  //选中项的索引
    //   alert(selects.options[indexs].value);
    // }
            this.i = this.querySelector('[data-setting="lut-size"]'),
            this.l = this.querySelector('[data-action="convert-lut"]'),
            this.u = n,
            this.p = o,
            this.m = i,
            this.g = i.getContext("2d", {
                willReadFrequently: !0
            }),
            this.addEventListener("input", (t => {
                t.target === this.t && this.v()
            }
            )),
            this.addEventListener("change", (n => {
                n.target === t ? Array.from(n.target.files).forEach(( (t, e, n) => {
                    this.$(t).then((t => {
                        o.insertBefore(t, o.querySelector(".default-lut").nextElementSibling),
                        t.click()
                    }
                    ))
                }
                )) : n.target === e && n.target.files?.length && this.L(n.target.files[0])
            }
            )),
            this.addEventListener("click", (n => {
                if (n.target.closest('[data-action="load-luts"]'))
                    t.click();
                else if (n.target.closest('[data-action="load-image"]'))
                    e.click();
                else if (n.target.closest('[data-action="convert-lut"]')) {
                    const t = o.querySelector(".selected");
                    t ? this._(t._lut) : alert("Select a LUT before you export...")
                } else if (n.target.closest(".lut-file:not(.default-lut) .remove-icon")) {
                    const t = n.target.closest(".lut-file")
                      , e = t.classList.contains("selected") ? t.nextElementSibling || t.previousElementSibling : null;
                    t.remove(),
                    e && e.click()
                } else if (n.target.closest(".lut-file")) {
                    for (let t = 0; t < o.children.length; t++)
                        o.children[t].classList.toggle("selected", o.children[t].contains(n.target));
                    this.T()
                }
            }
            )),
            ot(window, ( () => {
                const t = this.m.clientWidth * window.devicePixelRatio
                  , e = this.m.clientHeight * window.devicePixelRatio;
                requestAnimationFrame(( () => {
                    this.m.width = t,
                    this.m.height = e,
                    this.g.lineWidth = .01 * this.m.width,
                    this.g.lineWidth = this.g.lineWidth > 3.5 ? 3.5 : this.g.lineWidth < 1 ? 1 : this.g.lineWidth,
                    this.k()
                }
                ))
            }
            )),
            this.L("https://fs-im-kefu.7moor-fs1.com/ly/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/1753178606618/example.jpg"),
            this.$({
                name: "cio.default.cube"
            }).then((t => {
                o.appendChild(t),
                t.click()
            }
            )),
            this.v()
        },
        $(t) {
            const e = Object.assign(document.createElement("div"), {
                className: "lut-file flex-none pos-rel h-250 flex-row nowrap center gap-100 pd-100 rounded-100 cursor-pointer",
                _extension: `.${t.name.split(".").pop()}`,
                _name: "",
                _lut: null
            });
            return e._name = t.name.replace(e._extension, ""),
            new Promise(( (n, o) => {
                "cio.default.cube" === t.name ? (e._name = "Default",
                e.classList.add("default-lut"),
                n({
                    data: vt(64),
                    title: e._name,
                    size: 64
                })) : ".cube" === e._extension ? t.text().then((t => n((t => {
                    let e = Z.exec(t);
                    const n = null !== e ? e[1] : null;
                    if (e = B.exec(t),
                    null === e)
                        throw new Error("Invalid cube file. LUT_3D_SIZE Metadata missing.");
                    const o = Number(e[1])
                      , i = {
                        title: n || "",
                        size: o,
                        data: new Float64Array(o ** 3 * 3)
                    };
                    let s = 0;
                    for (; null !== (e = q.exec(t)); )
                        i.data[s++] = H(0, 1, Number(e[1])),
                        i.data[s++] = H(0, 1, Number(e[2])),
                        i.data[s++] = H(0, 1, Number(e[3]));
                    return i
                }
                )(t)))).catch(o) : ".png" === e._extension ? function(t, e=!1, n=8, o=450) {
                    return new Promise(( (i, s) => {
                        "boolean" != typeof e && s("alpha parameter must be boolean"),
                        8 !== n && 16 !== n && 32 !== n && s("precision parameter must be 8, 16 or 32"),
                        isNaN(o) && s("maxRes parameter must be a number"),
                        V(t).then((t => {
                            const s = t.naturalWidth >= t.naturalHeight ? "maxWidth" : "maxHeight"
                              , a = G(t, {
                                [s]: o
                            })
                              , l = a.canvas
                              , r = a.getImageData(0, 0, l.width, l.height).data
                              , c = {
                                width: l.width,
                                height: l.height,
                                depth: n,
                                originalWidth: t.naturalWidth,
                                originalHeight: t.naturalHeight
                            };
                            if (e)
                                if (8 === n)
                                    i(Object.assign(c, {
                                        data: Array.from(r)
                                    }));
                                else {
                                    const t = [];
                                    for (let e = 0; e < r.length; e++)
                                        t.push(r[e] / 255);
                                    if (16 === n)
                                        for (let e = 0; e < r.length; e++)
                                            t[e] = Q(t[e]);
                                    i(Object.assign(c, {
                                        data: t
                                    }))
                                }
                            else if (8 === n) {
                                const t = [];
                                for (let e = 0; e < r.length; e += 4)
                                    t.push(r[e], r[e + 1], r[e + 2]);
                                i(Object.assign(c, {
                                    data: t
                                }))
                            } else {
                                const t = [];
                                for (let e = 0; e < r.length; e += 4)
                                    t.push(r[e] / 255, r[e + 1] / 255, r[e + 2] / 255);
                                if (16 === n)
                                    for (let e = 0; e < t.length; e++)
                                        t[e] = Q(t[e]);
                                i(Object.assign(c, {
                                    data: t
                                }))
                            }
                        }
                        ))
                    }
                    ))
                }(t, !1, 8, 999999).then((t => n({
                    data: et(nt(t.data)),
                    title: e._name,
                    size: l(t.data.length / 3)
                }))) : o("Unsupported format. This converter accepts .cube and .png files.")
            }
            )).then((t => {
                64 !== t.size && (t.data = F(t.data, 64),
                t.size = 64),
                t.width = t.height = 512,
                e._lut = t,
                e._greyAxis = function(t) {
                    const e = l(t.length / 3)
                      , n = [];
                    for (let o, i = 0; i < e; i++)
                        o = 3 * (i * e * e + i * e + i),
                        n.push(t[o], t[o + 1], t[o + 2]);
                    return n
                }(t.data);
                const {width: n, height: o} = tt.get(t.size);
                return e._lutCanvas = Object.assign(document.createElement("canvas"), {
                    width: n,
                    height: o
                }),
                e._lutCanvas.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(at(st(it(t.data)))),n,o), 0, 0),
                e.innerHTML = `\n        <svg class="w-125 h-125 flex-none lut-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19">\n          <path fill="#E2E2E9" fill-opacity=".5" d="M16.64 4.42a.17.17 0 0 0 0-.3L10.17.37a2.72 2.72 0 0 0-2.72 0L.98 4.12a.17.17 0 0 0 0 .3l7.74 4.55a.17.17 0 0 0 .18 0l7.74-4.55Z"/>\n          <path fill="#E2E2E9" d="M.25 5.57a.17.17 0 0 0-.25.15v7.36a2.03 2.03 0 0 0 1.01 1.75l6.87 4.12a.17.17 0 0 0 .25-.15v-8.54a.17.17 0 0 0-.08-.15L.25 5.57Z"/>\n          <path fill="#E2E2E9" fill-opacity=".75" d="M9.49 10.3v8.5a.17.17 0 0 0 .25.15l6.87-4.12a2.03 2.03 0 0 0 1-1.75V5.72a.17.17 0 0 0-.16-.17c-.03 0-.06 0-.09.02l-7.79 4.57a.17.17 0 0 0-.08.15Z"/>\n        </svg>\n        <svg class="w-125 h-125 flex-none remove-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">\n          <title>Remove LUT</title>\n          <path stroke="red" stroke-miterlimit="10" stroke-opacity=".65" stroke-width="2.2" d="M17 9A8 8 0 1 1 1 9a8 8 0 0 1 16 0Z"></path>\n          <path stroke="red" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9H6"></path>\n        </svg>\n        <div class="w-full h-full flex-col y-center gap-025">\n          <div class="text-s text-semibold max-w-350 trunc">${e._name}</div>\n        </div>\n      `,
                e
            }
            ))
        },
        T() {
            const t = this.p.querySelector(".lut-file.selected");
            t && (this.C = t,
            this.M && (this.U || (this.U = Object.assign(document.createElement("canvas"), {
                width: this.M.canvas.width,
                height: this.M.canvas.height
            }).getContext("2d")),
            this.U.putImageData(mt(this.M.getImageData(0, 0, this.U.canvas.width, this.U.canvas.height), this.C._lut), 0, 0)),
            this.k())
        },
        L(t) {
            V(t).then((t => {
                this.M = G(t, {}),
                this.M.willReadFrequently = !0,
                this.C && (this.U = Object.assign(document.createElement("canvas"), {
                    width: this.M.canvas.width,
                    height: this.M.canvas.height
                }).getContext("2d"),
                this.U.putImageData(mt(this.M.getImageData(0, 0, this.U.canvas.width, this.U.canvas.height), this.C._lut), 0, 0)),
                this.k()
            }
            ))
        },
        k() {
            this.g.clearRect(0, 0, this.m.width, this.m.height),
            this.U ? this.I(this.U.canvas) : this.M && this.I(this.M.canvas),
            this.C && (this.D(this.C._lutCanvas),
            this.A(this.C._greyAxis),
            this.O(this.C._greyAxis))
        },
        I(t) {
            const e = this.m.width / 2 / t.width
              , n = this.m.height / 2 / t.height
              , o = Math.min(e, n)
              , i = (this.m.width / 2 - t.width * o) / 2
              , s = (this.m.height / 2 - t.height * o) / 2;
            this.g.drawImage(t, 0, 0, t.width, t.height, i, s, t.width * o, t.height * o)
        },
        D(t) {
            const e = this.m.width / 2 / t.width
              , n = this.m.height / 2 / t.height
              , o = Math.min(e, n)
              , i = (this.m.width / 2 - t.width * o) / 2
              , s = this.m.height / 2 + (this.m.height / 2 - t.height * o) / 2;
            this.g.drawImage(t, 0, 0, t.width, t.height, i, s, t.width * o, t.height * o)
        },
        A(t) {
            const e = this.m.width / 2
              , n = this.m.width
              , o = this.m.height / 2
              , i = this.m.width / 2
              , s = this.m.height / 2
              , a = this.g;
            a.strokeStyle = "rgba(255, 255, 255, 0.1)";
            const l = i / 10
              , r = s / 10;
            for (let t = e; t < n; t += l)
                for (let e = 0; e < o; e += r)
                    a.strokeRect(t, e, l, r);
            a.beginPath(),
            a.moveTo(e, o),
            a.lineTo(n, 0),
            a.stroke();
            const c = t.length
              , h = c - 3;
            let u;
            for (a.strokeStyle = "red",
            a.beginPath(),
            a.moveTo(e, (1 - t[0]) * s),
            u = 3; u < c; u += 3)
                a.lineTo(u / h * i + e, (1 - t[u]) * s);
            for (a.lineTo(n, (1 - t[u - 3]) * s),
            a.stroke(),
            a.strokeStyle = "green",
            a.beginPath(),
            a.moveTo(e, (1 - t[1]) * s),
            u = 3; u < c; u += 3)
                a.lineTo(u / h * i + e, (1 - t[u + 1]) * s);
            for (a.lineTo(n, (1 - t[u - 2]) * s),
            a.stroke(),
            a.strokeStyle = "blue",
            a.beginPath(),
            a.moveTo(e, (1 - t[2]) * s),
            u = 3; u < c; u += 3)
                a.lineTo(u / h * i + e, (1 - t[u + 2]) * s);
            a.lineTo(n, (1 - t[u - 1]) * s),
            a.stroke()
        },
        O(t) {
            const e = this.m.width / 2
              , n = this.m.height / 2
              , o = this.m.width
              , i = this.m.height
              , s = this.g
              , a = this.g.createLinearGradient(e, i, o, n)
              , l = t.length - 1;
            for (let e = 0; e < t.length; e += 3)
                a.addColorStop(e / l, `rgb(${255 * t[e]}, ${255 * t[e + 1]}, ${255 * t[e + 2]})`);
            s.fillStyle = a,
            s.fillRect(e, n, e, n)
        },
        v() {
            const t = this.t.options[this.t.selectedIndex];
            if ("" === t.value)
                return this.i.setAttribute("disabled", ""),
                void this.l.setAttribute("disabled", "");
            this.i.removeAttribute("disabled"),
            this.l.removeAttribute("disabled");
            const e = (t.getAttribute("data-sizes") || "").split(",");
            for (let t, n = 0; n < this.i.options.length; n++)
                t = this.i.options[n],
                e.includes(t.value) ? t.removeAttribute("disabled") : (t.setAttribute("disabled", ""),
                this.i.value === t.value && (this.i.value = e[e.length - 1]))
        },
        _(t) {
            try {
                const e = parseInt(this.t.value)
                  , n = t.title + " - converted with Coooooolour"
                  , o = parseInt(this.i.value);
                [wt, bt, xt, $t, yt, zt].includes(e) ? this.j(t, e, n, o, (t => {
                    this.S(t)
                }
                )) : this.N(t, e, n, o, (t => {
                    this.S(t)
                }
                ))
            } catch (t) {
                console.error(t),
                alert(t.message)
            }
        },
        j(t, e, o, a, l) {
            const r = (t, e) => l({
                name: o,
                extension: e,
                type: "application/octet-stream",
                blob: new Blob([t],{
                    type: "application/octet-stream"
                })
            });
            e === wt ? r(R(t.data, o, a, 6, !1), "cube") : e === bt ? r(function(t, e, n) {
                t = F(t, n);
                const o = ["SPILUT 1.0", "3 3", n + " " + n + " " + n];
                for (let e = 0; e < n; e++)
                    for (let i = 0; i < n; i++)
                        for (let s = 0; s < n; s++) {
                            const a = 3 * (e + i * n + s * n * n);
                            o.push(`${e} ${i} ${s} ${t[a].toFixed(8)} ${t[a + 1].toFixed(8)} ${t[a + 2].toFixed(8)}`)
                        }
                return o.join("\n")
            }(t.data, 0, a), "spi3d") : e === xt ? r(function(t, e, n=65) {
                17 !== n && 33 !== n && 65 !== n && (n = 33),
                t = F(t, n);
                const o = ["# Canon LUT File", "# Generated by Coooooolour", "type gamut", "size " + n, "bit  32F", "order  bottom", "interval Equal", "name " + e, "values"];
                for (let e = 0; e < t.length; e += 3)
                    o.push(t[e].toFixed(8) + " " + t[e + 1].toFixed(8) + " " + t[e + 2].toFixed(8));
                return o.join("\n")
            }(t.data, o, a), "clut") : e === $t ? r(function(t, e) {
                t = F(t, 17);
                const o = ["# panasonic vlt file version 1.0", '# source vlt file "' + e + '.vlt"', "LUT_3D_SIZE 17", ""];
                for (let e = 0; e < t.length; e += 3)
                    o.push(i(4095, s(0, n(4095 * t[e]))).toString() + " " + i(4095, s(0, n(4095 * t[e + 1]))).toString() + " " + i(4095, s(0, n(4095 * t[e + 2]))).toString());
                return o.join("\n")
            }(t.data, o), "vlt") : e === yt ? r(R(t.data, o, a, 6, !0), "cube") : e === zt && r(function(t, e=64, n=6) {
                t = F(t, e);
                const o = [];
                for (let e = 0; e < t.length; e++)
                    o.push(t[e].toFixed(n));
                return o.join(",")
            }(t.data, a, 6), "csv")
        },
        N(t, e, n, o, i) {
            const s = (t, e, o) => {
                const s = Object.assign(document.createElement("canvas"), {
                    width: e,
                    height: o
                })
                  , a = s.getContext("2d")
                  , l = a.createImageData(e, o);
                at(t, l.data),
                a.putImageData(l, 0, 0),
                s.toBlob((t => i({
                    name: n,
                    extension: "png",
                    type: "image/png",
                    blob: t
                })), "image/png", 1)
            }
            ;
            5 === e ? s(st(F(et(it(t.data), "xzy"), o), 32), o * o, o) : 6 === e ? s(st(it(F(t.data, o)), 32), tt.get(o).width, tt.get(o).height) : 7 === e && s(st(F(t.data, o), 32), tt.get(o).width, tt.get(o).height)
        },
        S(t) {
            t.blob && (t.href = URL.createObjectURL(t.blob),
            setTimeout(( () => URL.revokeObjectURL(t.href)), 1e4));
            const e = `${t.name.replace(/\.[^/.]+$/, "")}.${t.extension}`;
            this.u.setAttribute("download", e),
            this.u.setAttribute("href", t.href),
            this.u.click()
        }
    }).use()
}();
