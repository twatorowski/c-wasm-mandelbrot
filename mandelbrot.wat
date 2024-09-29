(module $mandelbrot.wasm
  (type (;0;) (func))
  (type (;1;) (func (param i32 i32 f64 f64 f64 f64) (result i32)))
  (func $__wasm_call_ctors (type 0))
  (func $mandelbrot (type 1) (param i32 i32 f64 f64 f64 f64) (result i32)
    (local i32 f64 f64 f64 f64 i32 i32 f64 f64 i32 f64 f64 i32)
    i32.const 0
    local.set 6
    block  ;; label = @1
      local.get 1
      local.get 0
      i32.mul
      i32.const 16777216
      i32.gt_s
      br_if 0 (;@1;)
      i32.const 1024
      local.set 6
      local.get 1
      i32.const 1
      i32.lt_s
      br_if 0 (;@1;)
      local.get 0
      i32.const 1
      i32.lt_s
      br_if 0 (;@1;)
      local.get 4
      local.get 2
      f64.sub
      local.set 7
      local.get 5
      local.get 3
      f64.sub
      local.set 8
      local.get 0
      f64.convert_i32_s
      local.set 9
      local.get 1
      f64.convert_i32_s
      local.set 10
      i32.const 0
      local.set 11
      loop  ;; label = @2
        local.get 11
        local.get 0
        i32.mul
        local.set 12
        local.get 8
        local.get 11
        i32.const -1
        i32.xor
        local.get 1
        i32.add
        f64.convert_i32_s
        f64.mul
        local.get 10
        f64.div
        local.get 3
        f64.add
        local.set 13
        f64.const 0x0p+0 (;=0;)
        local.set 14
        i32.const 0
        local.set 15
        loop  ;; label = @3
          local.get 7
          local.get 14
          f64.mul
          local.get 9
          f64.div
          local.get 2
          f64.add
          local.set 16
          i32.const 0
          local.set 6
          f64.const 0x0p+0 (;=0;)
          local.set 4
          f64.const 0x0p+0 (;=0;)
          local.set 5
          block  ;; label = @4
            loop  ;; label = @5
              local.get 5
              local.get 4
              f64.mul
              local.set 17
              block  ;; label = @6
                local.get 16
                local.get 5
                local.get 5
                f64.mul
                local.get 4
                local.get 4
                f64.mul
                f64.sub
                f64.add
                local.tee 5
                local.get 5
                f64.mul
                local.get 13
                local.get 17
                local.get 17
                f64.add
                f64.add
                local.tee 4
                local.get 4
                f64.mul
                f64.add
                f64.const 0x1p+2 (;=4;)
                f64.gt
                i32.eqz
                br_if 0 (;@6;)
                local.get 6
                local.set 18
                br 2 (;@4;)
              end
              i32.const 255
              local.set 18
              local.get 4
              local.set 4
              local.get 6
              i32.const 1
              i32.add
              local.tee 6
              i32.const 255
              i32.ne
              br_if 0 (;@5;)
            end
          end
          local.get 15
          local.get 12
          i32.add
          i32.const 1024
          i32.add
          local.get 18
          i32.store8
          local.get 14
          f64.const 0x1p+0 (;=1;)
          f64.add
          local.set 14
          local.get 15
          i32.const 1
          i32.add
          local.tee 15
          local.get 0
          i32.ne
          br_if 0 (;@3;)
        end
        local.get 11
        i32.const 1
        i32.add
        local.tee 11
        local.get 1
        i32.ne
        br_if 0 (;@2;)
      end
      i32.const 1024
      local.set 6
    end
    local.get 6)
  (memory (;0;) 258)
  (global $__stack_pointer (mut i32) (i32.const 16843776))
  (global (;1;) i32 (i32.const 1024))
  (global (;2;) i32 (i32.const 1024))
  (global (;3;) i32 (i32.const 16778240))
  (global (;4;) i32 (i32.const 16778240))
  (global (;5;) i32 (i32.const 16843776))
  (global (;6;) i32 (i32.const 1024))
  (global (;7;) i32 (i32.const 16843776))
  (global (;8;) i32 (i32.const 16908288))
  (global (;9;) i32 (i32.const 0))
  (global (;10;) i32 (i32.const 1))
  (export "memory" (memory 0))
  (export "__wasm_call_ctors" (func $__wasm_call_ctors))
  (export "mandelbrot" (func $mandelbrot))
  (export "buf" (global 1))
  (export "__dso_handle" (global 2))
  (export "__data_end" (global 3))
  (export "__stack_low" (global 4))
  (export "__stack_high" (global 5))
  (export "__global_base" (global 6))
  (export "__heap_base" (global 7))
  (export "__heap_end" (global 8))
  (export "__memory_base" (global 9))
  (export "__table_base" (global 10)))
